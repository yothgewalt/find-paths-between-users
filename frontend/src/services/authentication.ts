import axiosInstance from "@utilities/axios";
import axiosRetry from "axios-retry";

axiosRetry(axiosInstance, { retries: 3 });

interface CreateAccountModel {
    email_address: string;
    first_name: string;
    last_name: string;
    password: string;
}

interface CreactAccountDataResponseModel {
    email_address: string;
    full_name: string;
    profile_slug: string;
}

interface CreateAccountResponseModel {
    status_code: number;
    error: string;
    message: string;
    data?: CreactAccountDataResponseModel;
}

interface AuthenticateAccountModel {
    email_address: string;
    password: string;
}

interface AuthenticateAccountDataResponseModel {
    access_token: string;
}

interface AuthenticateAccountResponseModel {
    status_code: number;
    error: string;
    message: string;
    data?: AuthenticateAccountDataResponseModel;
}

export const authenticationServices = {
    createAccount(bodyModel: CreateAccountModel): Promise<CreateAccountResponseModel> {
        return axiosInstance.post(`/users/create`, bodyModel);
    },
    authenticateAccount(bodyModel: AuthenticateAccountModel): Promise<AuthenticateAccountResponseModel> {
        return axiosInstance.post(`/users/authenticate`, bodyModel);
    }
};
