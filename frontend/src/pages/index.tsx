import React from "react";

import { useRouter } from "next/router";

import {
    Flex,
    Container,
    Input,
    PasswordInput,
    Button,
    Group,
    Text,
    Anchor,
    Box,
    Loader,
} from "@mantine/core";

import { IdentifyPageLayout } from "@layouts/core";

import { IconArrowRight, IconAt, IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { authenticationServices } from "@services/authentication";
import { regexValidator } from "@utilities/regex";
import { useUserStore } from "@context/user_context";

export default function IndexPage() {
    const router = useRouter();

    const getUser = useUserStore((state) => state.user);

    const [emailAddress, setEmailAddress] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);
    const [isSubmitLoading, setIsSubmitLoading] = React.useState<boolean>(false);

    const [isFetchedUser, setIsFetchedUser] = React.useState<boolean>(false);

    const emailValidateRegularExpression = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

    const emailHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setEmailAddress(inputValue);
        setIsEmailValid(regexValidator(inputValue, emailValidateRegularExpression));
    };

    const passwordHandler = (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event?.target?.value);

    const submitHandler = async () => {
        setIsSubmitLoading(true);

        if ((emailAddress.length === 0) || (password.length === 0)) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "กรุณาใส่ข้อมูลให้ครบถ้วน",
                message: "ดูเหมือนว่าอีเมลล์แอดเดรสหรือพาสเวิร์ดของคุณนั้นว่าง"
            });
        }

        if (!isEmailValid) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "รูปแบบของอีเมลล์แอดเดรสไม่ถูกต้อง",
                message: "ดูเหมือนว่าอีเมลล์แอดเดรสของคุณนั้นไม่ใช่รูปแบบที่ควรจะเป็น"
            });
        }

        try {
            const response = await authenticationServices.authenticateAccount({
                email_address: emailAddress,
                password: password,
            });

            if (response?.data?.access_token) {
                localStorage.setItem("authentication_token", response.data.access_token);
                notifications.show({
                    color: "green",
                    title: "เข้าสู่ระบบสำเร็จ",
                    message: "กำลังนำพาคุณไปสู่หน้าหลักของเว็บไซต์",
                    autoClose: 1512,
                });

                return router.push("/feed");

            } else if (response?.status_code === 401) {
                setIsSubmitLoading(false);
                return notifications.show({
                    color: "red",
                    title: "พาสเวิร์ดของคุณนั้นไม่ถูกต้อง",
                    message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
                });
            }

        } catch (error: unknown) {
            if (error instanceof Error) return error.message;

            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: String(error),
                message: "ดูเหมือนว่าจะมีข้อผิดพลาดบางอย่าง"
            });
        }
    };

    React.useEffect(() => {
        if (getUser) {
            setIsFetchedUser(true);
            router.push("/feed");
        }
    }, [router, getUser]);

    if (isFetchedUser) {
        return (
            <Box
                w={"100%"}
                h={"100vh"}
            >
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
            <IdentifyPageLayout>
                <Container w={320} h={"100%"} p={0}>
                    <Flex
                        w={320}
                        h={"100%"}
                        direction={"column"}
                        justify={"space-between"}
                        align={"center"}
                        gap={"lg"}
                    >
                        <Flex />
                        <Flex
                            w={320}
                            direction={"column"}
                            justify={"center"}
                            align={"center"}
                            gap={"md"}
                        >
                            <Text fw={700} fz={"xl"}>เว็บไซต์จำลองความสัมพันธ์ของเพื่อน</Text>
                            <Input.Wrapper
                                w={320}
                                id="email-address"
                                label="อีเมลล์แอดเดรส"
                                description="อีเมลล์แอดเดรสของคุณที่สมัครไว้กับทางเรา"
                                error={!isEmailValid && "รูปแบบของอีเมลล์แอดเดรสไม่ถูกต้อง"}
                            >
                                {isEmailValid ? (
                                    <Input
                                        id="email-address"
                                        icon={<IconAt size={18} />}
                                        placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                        onChange={emailHandler}
                                        required
                                    />
                                ) : (
                                    <Input
                                        id="email-address"
                                        icon={<IconAt size={18} />}
                                        placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                        onChange={emailHandler}
                                        error
                                        required
                                    />
                                )}
                            </Input.Wrapper>
                            <PasswordInput
                                w={320}
                                id="password"
                                label="พาสเวิร์ด"
                                description="พาสเวิร์ดเพื่อความปลอดภัยของบัญชี"
                                placeholder="กรุณาใส่พาสเวิร์ดเพื่อความปลอดภัย"
                                icon={<IconLock size={18} />}
                                onChange={passwordHandler}
                                withAsterisk
                                required
                            />
                            <Button
                                w={320}
                                color="blue"
                                onClick={submitHandler}
                                loading={isSubmitLoading}
                            >
                                <span>เข้าสู่ระบบด้วยอีเมลล์</span>
                            </Button>
                            <Anchor
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => router.push("/registration")}
                            >
                                <Text>สร้างแอคเค้าท์ใหม่สำหรับคุณ</Text>
                                &nbsp;
                                <IconArrowRight size={14} />
                            </Anchor>
                        </Flex>
                        <Group position="center" spacing={"xs"}>
                            <Text
                                fw={100}
                                sx={{ color: "#909296" }}
                            >
                                เว็บไซต์จำลองระบบความสัมพันธ์ระหว่างเพื่อน
                            </Text>
                        </Group>
                    </Flex>
                </Container>
            </IdentifyPageLayout>
        </>
    );
}
