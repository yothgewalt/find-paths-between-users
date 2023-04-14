import mysql.connector

from mysql.connector import pooling, connection, connection_cext
from argon2 import PasswordHasher
from typing import Optional, Any

from model import user_model
from helper import hash

class InitializeRepository:
    def __init__(
            self,
            database_source: pooling.PooledMySQLConnection | connection.MySQLConnection | connection_cext.CMySQLConnection
        ) -> None:
        self.database = database_source
        self.argon = PasswordHasher()
        self.cursor = self.database.cursor(buffered=True)
        
    def search_hashed_password_for_internal(self, email_address: str) -> str:
        email_address = email_address.lower()
        
        try:
            query_model = "SELECT password FROM member_collection_schema WHERE email_address = %s LIMIT 1"
            self.cursor.execute(query_model, (email_address, ))
            row: Optional[tuple] = self.cursor.fetchone()
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        hashed_password = None
        
        if row is not None:
            hashed_password = str(row[0])
            
        return str(hashed_password)
        
    async def search_user_for_internal(self, email_address: str) -> list[Any] | str:
        email_address = email_address.lower()
        
        try:
            query_model = "SELECT id, email_address, first_name, last_name, profile_slug FROM member_collection_schema WHERE email_address = %s LIMIT 1"
            self.cursor.execute(query_model, (email_address, ))
            row: Optional[tuple] = self.cursor.fetchone()
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        id_row = None
        email_address_row = None
        first_name_row = None
        last_name_row = None
        profile_slug_row = None
        
        if row is not None:
            id_row = row[0]
            email_address_row = row[1]
            first_name_row = row[2]
            last_name_row = row[3]
            profile_slug_row = row[4]
        
        return [id_row, email_address_row, first_name_row, last_name_row, profile_slug_row]
    
    def search_user_for_internal_by_id(self, id) -> list[Any] | str:
        try:
            query_model = "SELECT id, email_address, first_name, last_name, profile_slug FROM member_collection_schema WHERE id = %s LIMIT 1"
            self.cursor.execute(query_model, (id, ))
            row: Optional[tuple] = self.cursor.fetchone()
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        id_row = None
        email_address_row = None
        first_name_row = None
        last_name_row = None
        profile_slug_row = None
        
        if row is not None:
            id_row = row[0]
            email_address_row = row[1]
            first_name_row = row[2]
            last_name_row = row[3]
            profile_slug_row = row[4]
        
        return [id_row, email_address_row, first_name_row, last_name_row, profile_slug_row]
    
    def search_user_for_public(self, owner_reference, query: str):
        try:
            query_model = "SELECT id, first_name, last_name, profile_slug FROM member_collection_schema WHERE (first_name LIKE %s OR last_name LIKE %s) AND id != %s"
            query_parameter = "%{}%".format(query)
            self.cursor.execute(query_model, (query_parameter, query_parameter, owner_reference, ))
            result_users = self.cursor.fetchall()
        
        except mysql.connector.Error as err: 
            return str(err.msg)
        
        return result_users
    
    def create_user(self, user_information: user_model.CreateUserModel) -> list[str] | str:
        user_information.email_address = str(user_information.email_address).lower()
        
        try:
            query_model = "SELECT email_address, COUNT(*) FROM member_collection_schema WHERE email_address = %s GROUP BY email_address"
            query_value = (user_information.email_address, )
            self.cursor.execute(query_model, query_value)
            
            row_count = self.cursor.rowcount
            if row_count > 0:
                return "email address has been taken."
            
        except mysql.connector.Error as err:
            return str(err.msg)
        
        user_information.first_name = str(user_information.first_name).lower()
        user_information.last_name = str(user_information.last_name).lower()
        profile_slug = hash.generate_profile_slug(user_information.first_name + user_information.last_name)
        user_information.password = self.argon.hash(str(user_information.password))
        
        try:
            query_model = "INSERT INTO member_collection_schema (email_address, first_name, last_name, profile_slug, password) VALUES (%s, %s, %s, %s, %s)"
            query_value = (user_information.email_address, user_information.first_name, user_information.last_name, profile_slug, user_information.password, )
            self.cursor.execute(query_model, query_value)
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        full_name: str = "{} {}".format(user_information.first_name, user_information.last_name)
        
        return [user_information.email_address, full_name, profile_slug]
    
    async def update_first_name_field(self, currently_value: str, new_value: str) -> str:
        try:
            query_model = "UPDATE member_collection_schema SET first_name = %s WHERE first_name = %s"
            self.cursor.execute(query_model, (new_value.lower(), currently_value, ))
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        return new_value
    
    async def update_last_name_field(self, currently_value: str, new_value: str) -> str:
        try:
            query_model = "UPDATE member_collection_schema SET last_name = %s WHERE last_name = %s"
            self.cursor.execute(query_model, (new_value.lower(), currently_value, ))
            
            print(self.cursor._executed)
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        return new_value
    
    async def update_slug_field(self, currently_value: str, new_value: str) -> str:
        try:
            query_model = "UPDATE member_collection_schema SET profile_slug = %s WHERE profile_slug = %s"
            self.cursor.execute(query_model, (new_value.lower(), currently_value, ))
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        return new_value
    
    async def update_password_field(self, email_address: str, new_password: str):
        hashed_password = self.argon.hash(new_password)
        
        try:
            query_model = "UPDATE member_collection_schema SET password = %s WHERE email_address = %s"
            self.cursor.execute(query_model, (hashed_password, email_address, ))
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        self.database.commit()
        
        return True
    
    async def get_all_ids_user(self, owner_reference):
        idx_list: list = []
        try:
            query_model = "SELECT id FROM member_collection_schema WHERE id != %s"
            self.cursor.execute(query_model, (owner_reference, ))
            idx_row: Optional[list] = self.cursor.fetchall()
            
            for index in range(0, len(idx_row)):
                idx_list.append(idx_row[index][0])
        
        except mysql.connector.Error as err:
            return str(err.msg)
        
        return idx_list
    