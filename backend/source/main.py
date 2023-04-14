import os
import mysql.connector

from datetime import datetime, timedelta

from dotenv import load_dotenv
load_dotenv()

from fastapi import Depends, FastAPI, Response, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from jose import JWTError, jwt

from repository import user, friend

from helper import regex
from model import user_model, common_model, profile_model

from argon2 import PasswordHasher, exceptions

from typing import Optional, Any

planetscale = mysql.connector.connect(
    host = "localhost",
    user = "<user>",
    passwd = "<passwd>",
    db = "<database>",
)

user_repository = user.InitializeRepository(planetscale)
friend_repository = friend.InitializeRepository(planetscale)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

argon = PasswordHasher()

orgins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=orgins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def authenticate(email_address: str, password: str):
    fetch_user = await user_repository.search_user_for_internal(email_address)
    if len(fetch_user) == 0 or not fetch_user:
        return False
    
    try:
        hashed_password = user_repository.search_hashed_password_for_internal(email_address)
        
        try:
            argon.verify(hashed_password, password=password)
            
        except exceptions.InvalidHash:
            return False
        
    except exceptions.VerifyMismatchError:
        return False
    
    return fetch_user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=8)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, str(os.getenv("JWT_SECRET_KEY")), algorithm=str(os.getenv("JWT_ALGORITHM")))
    
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"}
    )
    
    try:
        payload = jwt.decode(token, str(os.getenv("JWT_SECRET_KEY")), algorithms=[str(os.getenv("JWT_ALGORITHM"))])
        
        email_address: str | None = payload.get("sub")
        if email_address is None:
            raise credentials_exception
        
        token_data = user_model.TokenData(email_address=email_address)
        
    except JWTError:
        raise credentials_exception
    
    user_information = await user_repository.search_user_for_internal(email_address=str(token_data.email_address))
    if user_information is None:
        raise credentials_exception
    
    return user_model.UserModel(
        id=user_information[0],
        email_address=token_data.email_address,
        first_name=user_information[2],
        last_name=user_information[3],
        profile_slug=user_information[4]
    )

@app.get("/", status_code=status.HTTP_503_SERVICE_UNAVAILABLE, response_model=common_model.DefaultResponseModel)
async def root():
    return common_model.DefaultResponseModel(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        error=None,
        message="service unavaliable, please try again with other routes.",
        data=None
    )

@app.post("/users/create", status_code=status.HTTP_201_CREATED, response_model=common_model.DefaultResponseModel)
async def users_create(request_model: user_model.CreateUserModel, response: Response):
    email_validate: bool = regex.email_validator(str(request_model.email_address).lower())
    if not email_validate:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="email address incorrect format.",
            data=None
        )
        
    if (len(str(request_model.first_name)) > 64) or (len(str(request_model.first_name)) < 1):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="firstname cannot more than 64 letters or less than 1 letter.",
            data=None
        )
        
    if (len(str(request_model.last_name)) > 64) or (len(str(request_model.last_name)) < 1):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="lastname cannot more than 64 letters or less than 1 letter.",
            data=None
        )
        
    
    password_validate: bool = regex.password_validator(str(request_model.password))
    if not password_validate:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="password incorrect format or password length too short (min: 8).",
            data=None
        )
    
    response_action = user_repository.create_user(request_model)
    if type(response_action) == str:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=response_action,
            message="something went wrong.",
            data=None
        )
    
    return common_model.DefaultResponseModel(
        status_code=status.HTTP_201_CREATED,
        error=None,
        message="successfully, created an user.",
        data={
            "email_address": response_action[0],
            "full_name": response_action[1],
            "profile_slug": response_action[2]
        }
    )

@app.post("/users/authenticate", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_authenticate(response: Response, request_body: user_model.AuthenticateUserModel):
    user = await authenticate(str(request_body.email_address), str(request_body.password))
    
    if not user:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error=None,
            message="อีเมลล์หรือพาสเวิร์ดนั้นไม่ถูกต้อง",
            data=None
        )
        
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user[1]},
        expires_delta=access_token_expires
    )
    
    return common_model.DefaultResponseModel(
        status_code=status.HTTP_200_OK,
        error=None,
        message="authenticated",
        data={
            "access_token": access_token,
        }
    )
    
@app.get("/users/search", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_search(query: str | None, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    if query:
        users = user_repository.search_user_for_public(owner_reference=current_user.id, query=query)
        if not users is None:
            response.status_code = status.HTTP_200_OK
            
            response_data: list[dict] = []
            for user in users:
                friend_status = friend_repository.is_friend(current_user.id, user[0])
                
                response_data.append({
                    "id": user[0],
                    "first_name": user[1],
                    "last_name": user[2],
                    "is_friend": friend_status,
                    "profile_slug": user[3]
                })
                
            return common_model.DefaultResponseModel(
                status_code=status.HTTP_200_OK,
                error=None,
                message="search results",
                data=response_data
            )
            
        else:
            response.status_code = status.HTTP_404_NOT_FOUND
            return common_model.DefaultResponseModel(
                status_code=status.HTTP_404_NOT_FOUND,
                error=None,
                message="user not found",
                data=None
            )
            
    return common_model.DefaultResponseModel(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
        error=None,
        message="query parameter was missing",
        data=None
    )
    
@app.put("/users/profile/firstname", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_profile_firstname(request_model: profile_model.RequestUpdateField, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    if (len(str(request_model.update_field)) > 64) or (len(str(request_model.update_field)) < 1):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="firstname cannot more than 64 letters or less than 1 letter.",
            data=None
        )
        
    result = await user_repository.update_first_name_field(str(current_user.first_name), str(request_model.update_field))
    
    if result == request_model.update_field:
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="the field has been updated.",
            data={
                "currently": result
            }
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=result,
            message="the field cannot update.",
            data=None
        )

@app.put("/users/profile/lastname", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_profile_lastname(request_model: profile_model.RequestUpdateField, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    if (len(str(request_model.update_field)) > 64) or (len(str(request_model.update_field)) < 1):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="lastname cannot more than 64 letters or less than 1 letter.",
            data=None
        )
        
    result = await user_repository.update_last_name_field(str(current_user.last_name), str(request_model.update_field))
    
    if result == request_model.update_field:
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="the field has been updated.",
            data={
                "currently": result
            }
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=result,
            message="the field cannot update.",
            data=None
        )
    
@app.put("/users/profile/slug", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_profile_slug(request_model: profile_model.RequestUpdateField, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    if (len(str(request_model.update_field)) > 32) or (len(str(request_model.update_field)) < 6):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="slug cannot more than 32 letters or less than 6 letter.",
            data=None
        )
        
    result = await user_repository.update_slug_field(str(current_user.profile_slug), str(request_model.update_field))
    
    if result == request_model.update_field:
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="the field has been updated.",
            data={
                "currently": result
            }
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=result,
            message="the field cannot update.",
            data=None
        )

@app.get("/users/me", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_me(current_user: user_model.UserModel = Depends(get_current_user)):
    print(current_user)

    return common_model.DefaultResponseModel(
        status_code=status.HTTP_200_OK,
        error=None,
        message="successfully",
        data=current_user
    )

@app.put("/users/profile/password", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def users_profile_password(request_model: profile_model.RequestUpdatePasswordField, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    hashed_password = user_repository.search_hashed_password_for_internal(str(current_user.email_address))
    try:
        argon.verify(hashed_password, password=str(request_model.currently_password))
            
    except exceptions.VerifyMismatchError:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return common_model.DefaultResponseModel(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error=None,
                message="พาสเวิร์ดปัจจุบันไม่ถูกต้อง",
                data=None
            )
        
    password_validate: bool = regex.password_validator(str(request_model.update_field))
    if not password_validate:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message="รูปแบบพาสเวิร์ดไม่ถูกต้องหรือว่าความยาวน้อยกว่า 8 ตัว",
            data=None
        )
        
    result = await user_repository.update_password_field(str(current_user.email_address), str(request_model.update_field))
    if result:
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="เปลี่ยนพาสเวิร์ดสำเร็จแล้ว",
            data=None
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=None,
            message="เกิดอะไรขึ้นบางอย่างในฟังก์ชั่นการเปลี่ยนพาสเวิร์ด",
            data=None
        )
    
@app.get("/friends/list", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_list(response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_list_response = friend_repository.friend_list(current_user.id)
    if len(friend_list_response) < 1:
        response.status_code = status.HTTP_404_NOT_FOUND
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_404_NOT_FOUND,
            error=None,
            message="you have no friends.",
            data=[]
        )
    
    if type(friend_list_response) == str:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=friend_list_response,
            message="something went wrong.",
            data=None
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="all the friends you have.",
            data={
                "size": len(friend_list_response),
                "friend_list": friend_list_response
            }
        )
    
@app.get("/friends/request/list", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_request_list(response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_request_list_response = friend_repository.friend_request_list(current_user.id)
    if len(friend_request_list_response) < 1:
        response.status_code = status.HTTP_404_NOT_FOUND
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_404_NOT_FOUND,
            error=None,
            message="you have no friend requests.",
            data=[]
        )
        
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="all the friend requests you have.",
            data=friend_request_list_response
        )
    
@app.post("/friends/request/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def request_friend(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_request_response = await friend_repository.friend_request(current_user.id, member_id)
    if ((friend_request_response == "you have already sent a friend request.") or (friend_request_response == "the user who wants to add friends doesn't exist.")):
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_request_response,
            data=None
        )
    
    if friend_request_response == "you have sent a friend request.":
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message=friend_request_response,
            data=None
        )
    
    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR  ,
            error=friend_request_response,
            message="something went wrong about friend request.",
            data=None
        )

@app.post("/friends/approve/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_approve(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_approve_response = await friend_repository.friend_approve(current_user.id, member_id)
    if friend_approve_response == "you are already friends with this person.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_approve_response,
            data=None
        )
    
    if friend_approve_response == "you have accepted your friend request.":
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message=friend_approve_response,
            data=None
        )
        
    if friend_approve_response == "you can't accept yourself as a friend.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_approve_response,
            data=None
        )
        
    if friend_approve_response == "you cannot make a friend request because the target that you want to request is in your friend request list.":
        response.status_code = status.HTTP_409_CONFLICT
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_409_CONFLICT,
            error=None,
            message=friend_approve_response,
            data=None
        )
        
    if friend_approve_response == "you cannot accept the friend request instead target.":
        response.status_code = status.HTTP_400_BAD_REQUEST
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_400_BAD_REQUEST,
            error=None,
            message=friend_approve_response,
            data=None
        )
        
    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR  ,
            error=friend_approve_response,
            message="something went wrong about friend request.",
            data=None
        )
    
@app.post("/friends/cancel/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_cancel(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_cancel_response = await friend_repository.friend_cancel(current_user.id, member_id)
    if friend_cancel_response == "you can't cancel yourself.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_cancel_response,
            data=None
        )
        
    elif friend_cancel_response == "friend request dosen't exists.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_cancel_response,
            data=None
        )
        
    elif friend_cancel_response == "you have cancel your request for them.":
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message=friend_cancel_response,
            data=None
        )
        
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=friend_cancel_response,
            message="something went wrong.",
            data=None
        )
    
@app.post("/friends/deny/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_deny(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_deny_response = await friend_repository.friend_deny(current_user.id, member_id)
    if friend_deny_response == "you can't deny yourself.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_deny_response,
            data=None
        )
        
    elif friend_deny_response == "friend request dosen't exists.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_deny_response,
            data=None
        )
        
    elif friend_deny_response == "you have removed the friend request.":
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message=friend_deny_response,
            data=None
        )
        
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=friend_deny_response,
            message="something went wrong.",
            data=None
        )

    
@app.post("/friends/delete/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_delete(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_delete_response = await friend_repository.friend_delete(current_user.id, member_id)
    if friend_delete_response == "you can't delete yourself as a friend.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_delete_response,
            data=None
        )
            
    elif friend_delete_response == "you are not friends with that id.":
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error=None,
            message=friend_delete_response,
            data=None
        )
            
    elif friend_delete_response == "you have deleted your friend.":
        response.status_code = status.HTTP_200_OK
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message=friend_delete_response,
            data=None
        )
            
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=friend_delete_response,
            message="something went wrong.",
            data=None
        )

@app.get("/friends/mutual/{member_id}", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_mutual(member_id, response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_mutual_response = await friend_repository.friend_mutual_total(current_user.id, member_id)
    if type(friend_mutual_response) == int:
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_200_OK,
            error=None,
            message="all mutual friends.",
            data={
                "friend_mutual_total": friend_mutual_response,
            }
        )
        
    elif friend_mutual_response == "no mutual friends.":
        response.status_code = status.HTTP_404_NOT_FOUND
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_404_NOT_FOUND,
            error=None,
            message=str(friend_mutual_response),
            data=None
        )
        
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return common_model.DefaultResponseModel(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error=str(friend_mutual_response),
            message="something went wrong.",
            data=None
        )
        
@app.get("/friends/recommended", status_code=status.HTTP_200_OK, response_model=common_model.DefaultResponseModel)
async def friends_recommended(response: Response, current_user: user_model.UserModel = Depends(get_current_user)):
    friend_recommended_list: list = []
    friend_recommended_informaton_list: list[dict[str, Any]] = []
    
    id_users_response = await user_repository.get_all_ids_user(current_user.id)
    for id in id_users_response:
        friend_recommended_response = await friend_repository.friend_recommended(current_user.id, id)
        
        if type(friend_recommended_response) == bool:
            continue
        
        elif type(friend_recommended_response) == str:
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return common_model.DefaultResponseModel(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                error=str(friend_recommended_response),
                message="something went wrong.",
                data=None
            )
            
        else:
            friend_recommended_list.append(id)
    
    for account_id in friend_recommended_list:
        fetch_user = user_repository.search_user_for_internal_by_id(account_id)
        friend_status = friend_repository.is_friend(current_user.id, str(fetch_user[0]))
        friend_recommended_informaton_list.append({
            "id": fetch_user[0],
            "full_name": "{} {}".format(fetch_user[2], fetch_user[3]),
            "is_friend": friend_status,
            "profile_slug": fetch_user[4]
        })
        
    return common_model.DefaultResponseModel(
        status_code=status.HTTP_200_OK,
        error=None,
        message="all friend recommended",
        data=friend_recommended_informaton_list
    )
