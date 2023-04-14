import axiosInstance from "@utilities/axios";

interface FriendListDataModel {
    id: number;
    full_name: string;
    is_friend: string;
    profile_slug: string;
}

interface FriendListDataResponseModel {
    size: number;
    friend_list: FriendListDataModel[];
}

export interface FriendListResponseModel {
    status_code: number;
    error: any;
    message: string;
    data?: FriendListDataResponseModel;
}

export interface FriendRequestListResponseModel {
    status_code: number;
    error: any;
    message: string;
    data?: FriendListDataModel[];
}

interface CommonFriendResponseModel {
    status_code: number;
    error: any | null;
    message: string;
    data: any | null;
}

interface MutualFriendDataResponseModel {
    friend_mutual_total: number;
}

export interface MutualFriendResponseModel {
    status_code: number;
    error: any | null;
    message: string;
    data?: MutualFriendDataResponseModel;
}

export interface FriendRecommendedResponseModel {
    status_code: number;
    error: any | null;
    message: string;
    data?: FriendListDataModel[];
}

export const friendServices = {
    getFriendList(): Promise<FriendListResponseModel> {
        return axiosInstance.get("/friends/list");
    },
    getFriendRequestList(): Promise<FriendRequestListResponseModel> {
        return axiosInstance.get("/friends/request/list");
    },
    requestFriendByID(queryID: string): Promise<CommonFriendResponseModel> {
        return axiosInstance.post(`/friends/request/${queryID}`);
    },
    approveFriendByID(queryID: string): Promise<CommonFriendResponseModel> {
        return axiosInstance.post(`/friends/approve/${queryID}`);
    },
    cancelFriendByID(queryID: string): Promise<CommonFriendResponseModel> {
        return axiosInstance.post(`/friends/cancel/${queryID}`);
    },
    denyFriendByID(queryID: string): Promise<CommonFriendResponseModel> {
        return axiosInstance.post(`/friends/deny/${queryID}`);
    },
    deleteFriendBy(queryID: string): Promise<CommonFriendResponseModel> {
        return axiosInstance.post(`/friends/delete/${queryID}`);
    },
    getAllMutualFriend(queryID: string): Promise<MutualFriendResponseModel> {
        return axiosInstance.get(`/friends/mutual/${queryID}`);
    },
    getFriendRecommended(): Promise<FriendRecommendedResponseModel> {
        return axiosInstance.get("/friends/recommended")
    }
};
