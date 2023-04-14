import React from "react";

import { IdentifyPageLayout } from "@layouts/core";

import {
    Box,
    Flex,
    Container,
    Group,
    Text,
    Input,
    LoadingOverlay,
    PasswordInput,
    Button,
    Anchor,
} from "@mantine/core";

import { regexValidator } from "@utilities/regex";

import { IconArrowRight, IconAt, IconLock, IconCircleCheckFilled, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { authenticationServices } from "@services/authentication";

export default function RegistrationPage() {
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState<string>("");
    const [firstName, setFirstName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [isEmailValid, setIsEmailValid] = React.useState<boolean>(false);
    const [isFirstNameValid, setIsFirstNameValid] = React.useState<boolean>(false);
    const [isLastNameValid, setIsLastNameValid] = React.useState<boolean>(false);
    const [isSubmitLoading, setIsSubmitLoading] = React.useState<boolean>(false);

    const emailValidateRegularExpression = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    const nameValidateRegularExpression = new RegExp(/^(?:\p{L}+)+$/u);

    const emailHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setEmailAddress(inputValue.toLowerCase());
        setIsEmailValid(regexValidator(inputValue, emailValidateRegularExpression));
    };

    const firstNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if (inputValue.length < 4) {
            setIsFirstNameValid(false);
        }

        setFirstName(inputValue.toLowerCase());
        setIsFirstNameValid(regexValidator(inputValue, nameValidateRegularExpression));
    }

    const lastNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if (inputValue.length < 4) {
            setIsLastNameValid(false);
        }

        setLastName(inputValue.toLowerCase());
        setIsLastNameValid(regexValidator(inputValue, nameValidateRegularExpression));
    }

    const passwordHandler = (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);

    const submitHandler = async () => {
        setIsSubmitLoading(true);

        if ((emailAddress.length === 0) || (firstName.length === 0) || (lastName.length === 0) || (password.length === 0)) {
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

        if (password.length < 8) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "พาสเวิร์ดต้องมีมากกว่า 8 ตัวขึ้นไป",
                message: "ดูเหมือนว่าพาสเวิร์ดสของคุณนั้นไม่ใช่รูปแบบที่ควรจะเป็น"
            });
        }

        try {
            const response = await authenticationServices.createAccount({
                email_address: emailAddress,
                first_name: firstName,
                last_name: lastName,
                password: password
            });

            if (response?.status_code === 201) {
                notifications.show({
                    color: "green",
                    title: "สมัครแอคเค้าท์ส่วนตัวสำเร็จ",
                    message: "กำลังนำพาคุณไปที่หน้าล็อกอินเพื่อเข้าสู่ระบบ"
                })

                return router.push("/")
            } else {
                setIsSubmitLoading(false);

                return notifications.show({
                    color: "red",
                    title: response?.message,
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
    }

    return (
        <>
            <IdentifyPageLayout>
                <Container w={350} h={"100%"} p={0}>
                    <Flex
                        w={350}
                        h={"100%"}
                        direction={"column"}
                        justify={"space-between"}
                        align={"center"}
                        gap={"lg"}
                    >
                        <Flex />
                        <Box maw={350} h={"100%"} pos={"relative"}>
                            <LoadingOverlay visible={isSubmitLoading} overlayBlur={1} radius={"sm"} />
                            <Flex
                                w={350}
                                h={"100%"}
                                direction={"column"}
                                justify={"center"}
                                align={"center"}
                                gap={"md"}
                            >
                                <Text fw={700} fz={"xl"}>สร้างแอคเค้าท์ใหม่สำหรับคุณ</Text>
                                <Input.Wrapper
                                    w={320}
                                    id="email"
                                    label="อีเมลล์แอดเดรส"
                                    description="อีเมลล์แอดเดรสที่คุณต้องการใช้งาน"
                                    error={!isEmailValid && "รูปแบบของอีเมลล์แอดเดรสไม่ถูกต้อง"}
                                >
                                    {isEmailValid ? (
                                        <Input
                                            id="email"
                                            icon={<IconAt size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={emailHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="email"
                                            icon={<IconAt size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={emailHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                                <Input.Wrapper
                                    w={320}
                                    id="firstname"
                                    label="ชื่อ"
                                    description="ชื่อที่คุณต้องการให้แสดงระหว่างใช้งาน"
                                    error={!isFirstNameValid && "รูปแบบของชื่อไม่ถูกต้อง"}
                                >
                                    {isFirstNameValid ? (
                                        <Input
                                            id="firstname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={firstNameHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="firstname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={firstNameHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                                <Input.Wrapper
                                    w={320}
                                    id="lastname"
                                    label="นามสกุล"
                                    description="นามสกุลที่คุณต้องการให้แสดงระหว่างใช้งาน"
                                    error={!isLastNameValid && "รูปแบบของนามสกุลไม่ถูกต้อง"}
                                >
                                    {isLastNameValid ? (
                                        <Input
                                            id="lastname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={lastNameHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="lastname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลให้ถูกต้อง"
                                            onChange={lastNameHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                                <PasswordInput
                                    w={320}
                                    id="password"
                                    label="พาสเวิร์ด (8 ตัวอักษรขึ้นไป)"
                                    description="พาสเวิร์ดเพื่อความปลอดภัยของบัญชี"
                                    placeholder="กรุณาใส่พาสเวิร์ดเพื่อความปลอดภัย"
                                    icon={<IconLock size={18} />}
                                    onChange={passwordHandler}
                                    withAsterisk
                                    required
                                />
                                <Flex
                                    w={320}
                                    mt={16}
                                    direction={"column"}
                                    justify={"flex-start"}
                                    align={"start"}
                                    gap={"sm"}
                                >
                                    <Group spacing={8} position="center">
                                        {!isEmailValid ? (
                                            <IconCircleCheckFilled
                                                className="text-neutral-500"
                                                size={18}
                                            />
                                        ) : (
                                            <IconCircleCheckFilled
                                                className="text-green-400"
                                                size={18}
                                            />
                                        )}
                                        <Text fw={400} fz={"sm"}>
                                            รูปแบบอีเมลล์แอดเดรสที่ถูกต้อง
                                        </Text>
                                    </Group>
                                    <Group spacing={8} position="center">
                                        {isFirstNameValid && isLastNameValid ? (
                                            <IconCircleCheckFilled
                                                className="text-green-400"
                                                size={18}
                                            />
                                        ) : (
                                            <IconCircleCheckFilled
                                                className="text-neutral-500"
                                                size={18}
                                            />
                                        )}
                                        <Text fw={400} fz={"sm"}>
                                            ชื่อและนามสกุลมีแต่ตัวอักษร
                                        </Text>
                                    </Group>
                                </Flex>
                                <Button
                                    w={320}
                                    color="blue"
                                    onClick={submitHandler}
                                    loading={isSubmitLoading}
                                >
                                    <span>สร้างแอคเค้าท์ของคุณ</span>
                                </Button>
                                <Anchor
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => router.push("/")}
                                >
                                    <Text>คุณมีแอคเค้าท์อยู่แล้วงั้นเหรอ?</Text>
                                    &nbsp;
                                    <IconArrowRight size={14} />
                                </Anchor>
                            </Flex>
                        </Box>
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
