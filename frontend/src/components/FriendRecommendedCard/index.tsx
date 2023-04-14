import React from "react";
import {
    Button,
    Card,
    ColSpan,
    Grid,
    Group,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Image, { StaticImageData } from "next/image";
import { friendServices } from "@services/friend_interaction";

interface FriendRecommendedCardProps {
    gridSpanSize: ColSpan | undefined;
    friendId: number;
    abstractProfileImage: StaticImageData;
    fullNameProfile: string;
    friendStatus: string;
    totalMutualFriend: number | undefined;
}

export default function FriendRecommendedCard(props: FriendRecommendedCardProps) {
    const [friendRequest, setFriendRequest] = React.useState<string>(props.friendStatus);

    const [isAddLoading, setIsAddLoading] = React.useState<boolean>(false);
    const [isCancelLoading, setIsCancelLoading] = React.useState<boolean>(false);

    const AddFriend = async (query: number) => {
        setIsAddLoading(true);
        setFriendRequest("pending");

        try {
            const response = await friendServices.requestFriendByID(String(query));

            if (response.status_code === 200) {
                setIsAddLoading(false);
                return notifications.show({
                    color: "green",
                    title: "ส่งคำขอเป็นเพื่อนแล้ว",
                    message: "คำขอนี้จะถูกส่งไปยังบัญชีที่คุณขอเป็นเพื่อนไป"
                })

            } else {
                setIsAddLoading(false);
                return notifications.show({
                    color: "red",
                    title: "ดูเหมือนมีอะไรผิดพลาด",
                    message: "โปรดส่งความผิดพลาดนี้ไปยังผู้ดูแลระบบ"
                })
            }

        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            setIsAddLoading(false);
            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    }

    const CancelFriend = async (query: number) => {
        setIsCancelLoading(true);
        setFriendRequest("not");

        try {
            const response = await friendServices.cancelFriendByID(String(query));

            if (response.status_code === 200) {
                setIsCancelLoading(false);
                notifications.show({
                    color: "red",
                    title: "ยกเลิกคำขอเป็นเพื่อนแล้ว",
                    message: "คำขอนี้จะถูกลบออกไปจากระบบ"
                })

            } else {
                setIsCancelLoading(false);
                return notifications.show({
                    color: "red",
                    title: "ดูเหมือนมีอะไรผิดพลาด",
                    message: "โปรดส่งความผิดพลาดนี้ไปยังผู้ดูแลระบบ"
                })
            }

        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            setIsCancelLoading(false);
            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    }

    return (
        <Grid.Col span={props.gridSpanSize}>
            <Card miw={320} shadow="sm" padding={"lg"} radius={"md"} withBorder>
                <Card.Section>
                    <Image
                        src={props.abstractProfileImage}
                        height={320}
                        priority
                        alt="profile-user"
                    />
                </Card.Section>

                <Group position={"apart"} mt={"md"} mb={"xs"}>
                    <Text size={"xl"} weight={500}>
                        {props.fullNameProfile}
                    </Text>
                </Group>

                <Group mb={5}>
                    {props.totalMutualFriend === undefined ? (
                        <>เพื่อนของเพื่อนคุณ</>
                    ) : (
                        <>
                            เพื่อนร่วมกัน{" "}
                            {props.totalMutualFriend} คน
                        </>
                    )}
                </Group>

                {friendRequest === "not" && (
                    <Button
                        w={"100%"}
                        onClick={() => AddFriend(props.friendId)}
                        loading={isAddLoading}
                    >
                        เพิ่มเพื่อน
                    </Button>
                )}
                {friendRequest === "pending" && (
                    <Button
                        w={"100%"}
                        variant="light"
                        onClick={() => CancelFriend(props.friendId)}
                        loading={isCancelLoading}
                    >
                        ยกเลิกคำขอเป็นเพื่อน
                    </Button>
                )}
                {friendRequest === "friend" && (
                    <Button w={"100%"} variant="light" color="green">
                        เพื่อนของฉัน
                    </Button>
                )}
            </Card>
        </Grid.Col>
    );
}
