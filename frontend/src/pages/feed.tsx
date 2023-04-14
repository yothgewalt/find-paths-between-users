import { UserState, useUserStore } from "@context/user_context";
import NormalPageLayout from "@layouts/NormalPageLayout";
import {
    Box,
    Button,
    Card,
    Flex,
    Grid,
    Group,
    Input,
    Loader,
    Modal,
    Skeleton,
    Text,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import AbstractProfileUser from "./../../public/static/abstract-profile-user.webp";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FriendRecommendedCard } from "@components/core";
import { NextPage } from "next";
import { FriendRecommendedResponseModel, FriendRequestListResponseModel, friendServices } from "@services/friend_interaction";
import { SearchUserResponseModel, userInteractionServices } from "@services/user_interaction";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

const FRIEND_RECOMMENDED_PER_ROW: number = 3;
const USER_SEARCH_PER_ROW: number = 3;

const FeedPage: NextPage = () => {
    const router = useRouter();

    const getUser = useUserStore((state: UserState) => state.user);
    const [isFetchedUser, setIsFetchedUser] = React.useState<boolean>(true);

    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [userSearchObject, setUserSearchObject] = React.useState<SearchUserResponseModel>();

    const [nextFriendRecommendedRow, setFriendRecommendedRow] = React.useState<number>(FRIEND_RECOMMENDED_PER_ROW);
    const [nextUserSearchRow, setUserSearchRow] = React.useState<number>(USER_SEARCH_PER_ROW);

    const [friendRecommendedObject, setFriendRecommendedObject] = useState<FriendRecommendedResponseModel | undefined>();

    const [friendRequestObject, setFriendRequestObject] = useState<FriendRequestListResponseModel | undefined>();

    const [isApproveFriendLoading, setIsApproveFriendLoading] = React.useState<boolean>(false);
    const [isDenyFriendLoading, setIsDenyFriendLoading] = React.useState<boolean>(false);

    const [opened, { open, close }] = useDisclosure(false);

    const GetFriendRecommendedFunc = async () => {
        const friendRecommendedObjectResponse = await friendServices.getFriendRecommended();

        setFriendRecommendedObject(friendRecommendedObjectResponse);
    };

    const SearchUser = async (queryString: string) => {
        setSearchQuery(queryString);

        await userInteractionServices.searchUser(queryString).then((response) => {
            return setUserSearchObject(response);
        }).then((data) => {
            console.log(data);
        }).catch((error) => {
            console.error(error);
        });
    };

    const GetFriendRequestFunc = async () => {
        const friendRequestObjectResponse = await friendServices.getFriendRequestList();

        setFriendRequestObject(friendRequestObjectResponse);
    }

    const ApproveFriendHandler = async (queryString: string) => {
        setIsApproveFriendLoading(true);

        try {
            const response = await friendServices.approveFriendByID(queryString);

            if (response.status_code === 200) {
                setIsApproveFriendLoading(false);
                close()
                return notifications.show({
                    color: "green",
                    title: "ตอบรับคำขอเพื่อนแล้ว",
                    message: "คำขอนี้ถูกยอมรับแล้วและกำลังจะลบ"
                })
            } else {
                setIsApproveFriendLoading(false);
                close()
                return notifications.show({
                    color: "red",
                    title: "ดูเหมือนมีอะไรผิดพลาด",
                    message: "โปรดส่งความผิดพลาดนี้ไปยังผู้ดูแลระบบ"
                })
            }
        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            setIsApproveFriendLoading(false);
            close()
            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    };

    const DenyFriendHandler = async (queryString: string) => {
        setIsDenyFriendLoading(true);

        try {
            const response = await friendServices.denyFriendByID(queryString);

            if (response.status_code === 200) {
                setIsDenyFriendLoading(false);
                close()
                return notifications.show({
                    color: "green",
                    title: "ปฏิเสธคำขอแล้ว",
                    message: "คำขอนี้ถูกปฏิเสธแล้วและกำลังจะลบ"
                })
            } else {
                setIsDenyFriendLoading(false);
                close()
                return notifications.show({
                    color: "red",
                    title: "ดูเหมือนมีอะไรผิดพลาด",
                    message: "โปรดส่งความผิดพลาดนี้ไปยังผู้ดูแลระบบ"
                })
            }
        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            setIsApproveFriendLoading(false);
            close()
            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    }

    React.useEffect(() => {
        if (!getUser) {
            setIsFetchedUser(false);
            router.push("/");
        }

        GetFriendRecommendedFunc();
        GetFriendRequestFunc();
    }, [router, getUser]);

    if (!isFetchedUser) {
        return (
            <Box w={"100%"} h={"100vh"}>
                <Flex
                    w={"100%"}
                    h={"100%"}
                    direction={"column"}
                    justify={"center"}
                    align={"center"}
                    wrap={"nowrap"}
                >
                    <Loader size={"xl"} />
                </Flex>
            </Box>
        );
    }

    return (
        <>
            <Modal opened={opened} onClose={close} title={"รายการคำขอเป็นเพื่อน"}>
                {friendRequestObject !== undefined && (
                    <React.Fragment>
                        {friendRequestObject.data?.map((request) => {
                            return (
                                <>
                                    <Box>
                                        <Group position="apart">
                                            {request.full_name}
                                            <Group position="center" spacing={"xs"}>
                                                <Button
                                                    variant="light"
                                                    color="green"
                                                    loading={isApproveFriendLoading}
                                                    onClick={() => ApproveFriendHandler(String(request.id))}
                                                >
                                                    ยอมรับ
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    color="red"
                                                    loading={isDenyFriendLoading}
                                                    onClick={() => DenyFriendHandler(String(request.id))}
                                                >
                                                    ปฏิเสธ
                                                </Button>
                                            </Group>
                                        </Group>
                                    </Box>
                                </>
                            );
                        })}
                    </React.Fragment>
                )}
            </Modal>

            <NormalPageLayout>
                <Flex
                    w={"100%"}
                    h={"80px"}
                    direction={"row"}
                    justify={"space-between"}
                    align={"start"}
                    wrap={"nowrap"}
                >
                    <Box w={320}>
                        <Input.Wrapper
                            id="search"
                            label="ค้นหาผู้ใช้งาน"
                            description="กรอกชื่อผู้ใช้งานที่คุณต้องการแล้วระบบจะแนะนำขึ้นให้คุณ"
                        >
                            <Input
                                id="search"
                                icon={<IconSearch size={18} />}
                                placeholder="กรอกชื่อที่คุณต้องการ"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => SearchUser(event.target.value)}
                                radius={"md"}
                            />
                        </Input.Wrapper>
                    </Box>
                    <Group
                        w={"auto"}
                        h={"100%"}
                        position={"apart"}
                        spacing={"md"}
                    >
                        <Button variant="light" color="blue" onClick={open}>
                            <Text>ดูรายชื่อคำขอเป็นเพื่อน</Text>
                        </Button>
                        <Button variant="light" color="green" onClick={() => router.push("/friend")}>
                            <Text>ดูเพื่อนทั้งหมด</Text>
                        </Button>
                    </Group>
                </Flex>
                {searchQuery?.length !== 0 ? (
                    <React.Fragment>
                        <Text fw={600} size={"xl"}>ค้นหาผู้คนที่คุณต้องการ</Text>
                        <Grid>
                            {userSearchObject?.data?.slice(0, nextUserSearchRow)?.map((user) => {
                                const firstNameModified: string = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
                                const lastNameModified: string = user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1);
                                const fullNameModified: string = `${firstNameModified} ${lastNameModified}`;

                                return (
                                    <FriendRecommendedCard
                                        key={user.id}
                                        gridSpanSize={4}
                                        friendId={Number(user.id)}
                                        abstractProfileImage={AbstractProfileUser}
                                        fullNameProfile={fullNameModified}
                                        friendStatus={user.is_friend}
                                        totalMutualFriend={1}
                                    />
                                );
                            })}
                        </Grid>
                        {nextUserSearchRow > 3 && (
                            <Button
                                onClick={() =>
                                    setUserSearchRow(
                                        nextUserSearchRow +
                                        USER_SEARCH_PER_ROW
                                    )
                                }
                                variant={"light"}
                                size={"md"}
                                w={"100%"}
                            >
                                ค้นหาผู้ใช้งานเพิ่มเติมที่คุณอาจจะรู้จัก
                            </Button>
                        )}
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Text fw={600} size={"xl"}>คนที่คุณอาจจะรู้จัก</Text>
                        <Grid>
                            {friendRecommendedObject?.data
                                ?.slice(0, nextFriendRecommendedRow)
                                ?.map((recommended) => {
                                    const fullNameSplited =
                                        recommended.full_name.split(" ");
                                    const firstNameModified: string =
                                        fullNameSplited[0].charAt(0).toUpperCase() +
                                        fullNameSplited[0].slice(1);
                                    const lastNameModified: string =
                                        fullNameSplited[1].charAt(0).toUpperCase() +
                                        fullNameSplited[1].slice(1);
                                    const fullNameModified: string = `${firstNameModified} ${lastNameModified}`;

                                    return (
                                        <FriendRecommendedCard
                                            key={recommended.id}
                                            gridSpanSize={4}
                                            friendId={recommended.id}
                                            abstractProfileImage={AbstractProfileUser}
                                            fullNameProfile={fullNameModified}
                                            friendStatus={recommended.is_friend}
                                            totalMutualFriend={1}
                                        />
                                    );
                                })}
                        </Grid>
                        {nextFriendRecommendedRow < 4 && (
                            <Button
                                onClick={() =>
                                    setFriendRecommendedRow(
                                        nextFriendRecommendedRow +
                                        FRIEND_RECOMMENDED_PER_ROW
                                    )
                                }
                                variant={"light"}
                                size={"md"}
                                w={"100%"}
                            >
                                ค้นหาเพื่อนที่คุณอาจมีความเกี่ยวข้องด้วยเพิ่มเติม
                            </Button>
                        )}
                    </React.Fragment>
                )}
            </NormalPageLayout>
        </>
    );
};

export default FeedPage;
