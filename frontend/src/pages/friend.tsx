import React from "react";
import { UserState, useUserStore } from "@context/user_context";
import NormalPageLayout from "@layouts/NormalPageLayout";
import { Box, Button, Flex, Grid, Group, Loader, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { FriendListResponseModel, friendServices } from "@services/friend_interaction";
import AbstractProfileUser from "./../../public/static/abstract-profile-user.webp";
import FriendRecommendedCard from "@components/FriendRecommendedCard";

const FriendPage: NextPage = () => {
    const router = useRouter();
    const getUser = useUserStore((state: UserState) => state.user);

    const [isFetchedUser, setIsFetchedUser] = React.useState<boolean>(true);

    const [allFriendObject, setAllFriendObject] = React.useState<FriendListResponseModel>();

    const GetAllFriendFunc = async () => {
        try {
            const response = await friendServices.getFriendList();

            if (response.status_code === 200) {
                setAllFriendObject(response);
            }

        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    };

    React.useEffect(() => {
        if (!getUser) {
            setIsFetchedUser(false);
            router.push("/");
        }

        GetAllFriendFunc();
    }, [router, getUser])

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
            <NormalPageLayout>
                <Button variant="light" onClick={() => router.back()}>ย้อนกลับไปหน้าเดิม</Button>
                <Group mt={30} w={"100%"} position="center">
                    <Text size={"xl"} fw={600}>เพื่อนของฉันทั้งหมด ({allFriendObject?.data?.size} คน)</Text>
                </Group>
                <Grid mt={30}>
                        {allFriendObject?.data?.friend_list.map((friend) => {
                            const fullNameSplited =
                            friend.full_name.split(" ");
                        const firstNameModified: string =
                            fullNameSplited[0].charAt(0).toUpperCase() +
                            fullNameSplited[0].slice(1);
                        const lastNameModified: string =
                            fullNameSplited[1].charAt(0).toUpperCase() +
                            fullNameSplited[1].slice(1);
                        const fullNameModified: string = `${firstNameModified} ${lastNameModified}`;

                            return (
                                <FriendRecommendedCard
                                    key={friend.id}
                                    gridSpanSize={4}
                                    friendId={friend.id}
                                    abstractProfileImage={AbstractProfileUser}
                                    fullNameProfile={fullNameModified}
                                    friendStatus={friend.is_friend}
                                    totalMutualFriend={1}
                                />
                            );
                        })}
                    </Grid>
            </NormalPageLayout>
        </>
    );
}

export default FriendPage;
