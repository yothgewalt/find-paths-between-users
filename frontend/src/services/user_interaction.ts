import axiosInstance from "@utilities/axios";
import axiosRetry from "axios-retry";

axiosRetry(axiosInstance, { retries: 3 });

export interface GetUserInformationDataResponseModel {
    id: string;
    email_address: string;
    first_name: string;
    last_name: string;
    profile_slug: string;
}

interface GetUserInformationResponseModel {
    status_code: number;
    error: string;
    message: string;
    data?: GetUserInformationDataResponseModel;
}

interface UpdateModel {
    update_field: string;
}

interface UpdateDataResponseModel {
    currently: string;
}

interface UpdateResponseModel {
    status_code: number;
    error: string;
    message: string;
    data?: UpdateDataResponseModel;
}

interface PasswordUpdateModel {
    currently_password: string;
    update_field: string;
}

interface PasswordUpdateResponseModel {
    status_code: number;
    error: string | null;
    message: string;
    data: null;
}

interface SearchUserResponseDataModel {
    id: string;
    first_name: string;
    last_name: string;
    is_friend: string;
    profile_slug: string;
}

export interface SearchUserResponseModel {
    status_code: number;
    error: any;
    message: string;
    data?: SearchUserResponseDataModel[];
}

export const userInteractionServices = {
    getUserInformation(): Promise<GetUserInformationResponseModel> {
        return axiosInstance.get(`/users/me`);
    },
    updateFirstName(bodyModel: UpdateModel): Promise<UpdateResponseModel> {
        return axiosInstance.put("/users/profile/firstname", bodyModel);
    },
    updateLastName(bodyModel: UpdateModel): Promise<UpdateResponseModel> {
        return axiosInstance.put("/users/profile/lastname", bodyModel);
    },
    updateProfileSlug(bodyModel: UpdateModel): Promise<UpdateResponseModel> {
        return axiosInstance.put("/users/profile/slug", bodyModel);
    },
    updatePassword(bodyModel: PasswordUpdateModel): Promise<PasswordUpdateResponseModel> {
        return axiosInstance.put("/users/profile/password", bodyModel);
    },
    searchUser(query: string): Promise<SearchUserResponseModel> {
        return axiosInstance.get(`/users/search?query=${query}`);
    }
};
