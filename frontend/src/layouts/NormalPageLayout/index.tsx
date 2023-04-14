import React from "react";

import { Box, Button, Container, Flex, Group, Input, Modal, Text, LoadingOverlay, PasswordInput } from "@mantine/core";
import { useUserStore } from "@context/user_context";
import { IconAlertTriangleFilled, IconEdit, IconLink, IconLock, IconLogout, IconPassword, IconSettings, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { regexValidator } from "@utilities/regex";
import { userInteractionServices } from "@services/user_interaction";

const useHasHydrated = () => {
    const [hasHydrated, setHasHydrated] = React.useState<boolean>(false);

    React.useEffect(() => {
        setHasHydrated(true);
    }, []);

    return hasHydrated;
};

export default function NormalPageLayout({ children }: React.PropsWithChildren) {
    const router = useRouter();

    const hasHydrated = useHasHydrated();

    const getUser = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    const firstNameUser = (getUser?.first_name as string)?.charAt(0).toUpperCase() + (getUser?.first_name as string)?.slice(1);
    const lastNameUser = (getUser?.last_name as string)?.charAt(0).toUpperCase() + (getUser?.last_name as string)?.slice(1);

    const nameValidateRegularExpression = new RegExp(/^(?:\p{L}+)+$/u);
    const profileSlugValidateRegularExpression = new RegExp(/^[a-zA-Z0-9.]+$/);

    const [firstName, setFirstName] = React.useState<string>(getUser?.first_name as string);
    const [lastName, setLastName] = React.useState<string>(getUser?.last_name as string);
    const [profileSlug, setProfileSlug] = React.useState<string>(getUser?.profile_slug as string);

    const [currentlyPassword, setCurrentlyPassword] = React.useState<string>("");
    const [newPassword, setNewPassword] = React.useState<string>("");

    const [isLogout, setIsLogout] = React.useState<boolean>(false);
    const [isFirstNameValid, setIsFirstNameValid] = React.useState<boolean>(true);
    const [isLastNameValid, setIsLastNameValid] = React.useState<boolean>(true);
    const [isProfileSlugValid, setIsProfileSlugValid] = React.useState<boolean>(true);
    const [isSubmitLoading, setIsSubmitLoading] = React.useState<boolean>(false);

    const [opened, { open, close }] = useDisclosure(false);
    const [passwordChangerMode, changerModeToggle] = useToggle([false, true]);

    const FirstNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setFirstName(inputValue);
        setIsFirstNameValid(regexValidator(inputValue, nameValidateRegularExpression));
    };

    const LastNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setLastName(inputValue);
        setIsLastNameValid(regexValidator(inputValue, nameValidateRegularExpression));
    };

    const ProfileSlugHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        setProfileSlug(inputValue);
        setIsProfileSlugValid(regexValidator(inputValue, profileSlugValidateRegularExpression))
    };

    const CurrentlyPasswordHandler = (event: React.ChangeEvent<HTMLInputElement>) => setCurrentlyPassword(event.target.value);
    const NewPasswordHandler = (event: React.ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value);

    const SubmitHandler = async () => {
        setIsSubmitLoading(true);

        if ((firstName === getUser?.first_name) && (lastName === getUser?.last_name) && (profileSlug === getUser?.profile_slug)) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "ไม่สามารถอัปเดตได้",
                message: "ข้อมูลยังคงเหมือนเดิมไม่มีการเปลี่ยนแปลงแต่อย่างใด"
            })
        }

        if ((firstName.length === 0) || (lastName.length === 0) || (profileSlug.length === 0)) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "ช่องกรอกไม่สามารถว่างได้",
                message: "กรุณากรอกข้อมูลให้ตรงกับเงื่อนไข"
            })
        }

        if (firstName !== getUser?.first_name) {
            try {
                const response = await userInteractionServices.updateFirstName({ update_field: firstName });
                if (response?.status_code === 200) {
                    notifications.show({
                        color: "green",
                        title: "อัปเดตชื่อสำเร็จ",
                        message: `ปัจจุบันชื่อเปลี่ยนเป็น ${response.data?.currently}`
                    })
                }
                setIsSubmitLoading(false);

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

        if (lastName !== getUser?.last_name) {
            try {
                const response = await userInteractionServices.updateLastName({ update_field: lastName });
                if (response?.status_code === 200) {
                    notifications.show({
                        color: "green",
                        title: "อัปเดตนามสกุลสำเร็จ",
                        message: `ปัจจุบันนามกุลเปลี่ยนเป็น ${response.data?.currently}`
                    })
                }
                setIsSubmitLoading(false);

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

        if (profileSlug !== getUser?.profile_slug) {
            try {
                const response = await userInteractionServices.updateProfileSlug({ update_field: profileSlug });
                if (response?.status_code === 200) {
                    notifications.show({
                        color: "green",
                        title: "อัปเดตโปรไฟล์ย่อลิงก์สำเร็จ",
                        message: `ปัจจุบันย่อลิงก์ปลี่ยนเป็น ${response.data?.currently}`
                    })
                }
                setIsSubmitLoading(false);

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

        setIsSubmitLoading(false);
        router.push("/feed");
    };

    const LogoutHandler = () => {
        setIsLogout(true);
        setUser(null);
        localStorage.removeItem("authentication_token");

        notifications.show({
            color: "green",
            title: "ออกจากระบบสำเร็จ",
            message: "กำลังนำพาคุณไปยังหน้าเริ่มต้น",
            autoClose: 1512,
        });

        return router.push("/");
    };

    const PasswordChangerSubmitHandler = async () => {
        setIsSubmitLoading(true);

        if (newPassword.length < 8) {
            setIsSubmitLoading(false);
            return notifications.show({
                color: "red",
                title: "พาสเวิร์ดต้องมีมากกว่า 8 ตัวขึ้นไป",
                message: "ดูเหมือนว่าพาสเวิร์ดสของคุณนั้นไม่ใช่รูปแบบที่ควรจะเป็น"
            });
        }

        try {
            const response = await userInteractionServices.updatePassword({
                currently_password: currentlyPassword,
                update_field: newPassword
            });
            localStorage.removeItem("authentication_token");

            notifications.show({
                color: "green",
                title: response?.message as string,
                message: "คุณได้ทำการเปลี่ยนพาสเวิร์ดแล้วและคุณต้องล็อกอินใหม่่"
            });

            router.push("/")

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

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={`แก้ไขข้อมูล (${hasHydrated && getUser?.email_address})`}
                overlayProps={{
                    opacity: 0.55,
                    blur: 3
                }}
                centered
                size={"auto"}
            >
                <Box>
                    <LoadingOverlay visible={isSubmitLoading} overlayBlur={2} />
                    {passwordChangerMode ? (
                        <>
                            <Group h={105} position="apart">
                                <PasswordInput
                                    w={260}
                                    h={"100%"}
                                    id="currently-password"
                                    label="พาสเวิร์ดปัจจุบัน"
                                    description="กรอกพาสเวิร์ดปัจจุบันเพื่อยืนยันตัวตน"
                                    placeholder="กรุณาใส่พาสเวิร์ดเพื่อความปลอดภัย"
                                    icon={<IconLock size={18} />}
                                    onChange={CurrentlyPasswordHandler}
                                    withAsterisk
                                    required
                                />
                                <PasswordInput
                                    w={260}
                                    h={"100%"}
                                    id="new-password"
                                    label="พาสเวิร์ดใหม่ที่ต้องการ"
                                    description="กรอกพาสเวิร์ดใหม่ที่ต้องการจะเปลี่ยน"
                                    placeholder="กรุณาใส่พาสเวิร์ดที่ต้องการ"
                                    icon={<IconLock size={18} />}
                                    onChange={NewPasswordHandler}
                                    withAsterisk
                                    required
                                />
                            </Group>
                        </>
                    ) : (
                        <>
                            <Group h={90} position="apart">
                                <Input.Wrapper
                                    w={260}
                                    h={"100%"}
                                    id="firstname"
                                    label="ชื่อ"
                                    description="กรอกชื่อที่คุณต้องการจะเปลี่ยน"
                                    error={!isFirstNameValid && "รูปแบบของชื่อไม่ถูกต้อง"}
                                >
                                    {isFirstNameValid ? (
                                        <Input
                                            id="firstname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={getUser?.first_name && firstNameUser}
                                            onChange={FirstNameHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="firstname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={getUser?.first_name && firstNameUser}
                                            onChange={FirstNameHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                                <Input.Wrapper
                                    w={260}
                                    h={"100%"}
                                    id="lastname"
                                    label="นามสกุล"
                                    description="กรอกนามสกุลที่คุณต้องการจะเปลี่ยน"
                                    error={!isLastNameValid && "รูปแบบของนามสกุลไม่ถูกต้อง"}
                                >
                                    {isLastNameValid ? (
                                        <Input
                                            id="lastname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={getUser?.last_name && lastNameUser}
                                            onChange={LastNameHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="lastname"
                                            icon={<IconUser size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={getUser?.last_name && lastNameUser}
                                            onChange={LastNameHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                            </Group>
                            <Group h={112} mt={20} position="apart">
                                <Input.Wrapper
                                    w={"100%"}
                                    h={"100%"}
                                    id="profile-slug"
                                    label="โปรไฟล์ย่อลิงก์ (สูงสุด 64 ตัวอักษร)"
                                    description="กรอกชื่อย่อลิงก์สำหรับโปรไฟล์ของคุณที่ต้องการจะเปลี่ยน"
                                    error={!isProfileSlugValid && "รูปแบบของโปรไฟล์ย่อลิงก์ไม่ถูกต้อง"}
                                >
                                    {isProfileSlugValid ? (
                                        <Input
                                            id="profile-slug"
                                            icon={<IconLink size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={profileSlug}
                                            onChange={ProfileSlugHandler}
                                            required
                                        />
                                    ) : (
                                        <Input
                                            id="profile-slug"
                                            icon={<IconLink size={18} />}
                                            placeholder="กรุณาใส่ข้อมูลที่ต้องการ"
                                            value={profileSlug}
                                            onChange={ProfileSlugHandler}
                                            error
                                            required
                                        />
                                    )}
                                </Input.Wrapper>
                            </Group>
                        </>
                    )}
                    <Group spacing={"xs"}>
                        {passwordChangerMode ? (
                            <Button
                                w={"100%"}
                                variant={"light"}
                                color="gray"
                                onClick={() => changerModeToggle()}
                            >
                                <IconAlertTriangleFilled size={18} />
                                &nbsp;
                                เปลี่ยนพาสเวิร์ดของแอคเค้าท์
                            </Button>
                        ) : (
                            <Button
                                w={"100%"}
                                variant={"light"}
                                color="yellow"
                                onClick={() => changerModeToggle()}
                            >
                                <IconAlertTriangleFilled size={18} />
                                &nbsp;
                                เปลี่ยนพาสเวิร์ดของแอคเค้าท์
                            </Button>
                        )}
                        {passwordChangerMode ? (
                            <Button
                                w={"100%"}
                                loading={isSubmitLoading}
                                onClick={PasswordChangerSubmitHandler}
                                color="yellow"
                            >
                                <IconPassword size={18} />
                                &nbsp;
                                เปลี่ยนพาสเวิร์ด
                            </Button>
                        ) : (
                            <Button
                                w={"100%"}
                                loading={isSubmitLoading}
                                onClick={SubmitHandler}
                            >
                                <IconEdit size={18} />
                                &nbsp;
                                อัปเดตข้อมูล
                            </Button>
                        )}
                    </Group>
                </Box>
            </Modal>

            <Flex justify={"center"} w={"100%"} h={56} bg={"rgb(20, 21, 23)"}>
                <Container w={"100%"} h={"100%"} maw={"1152px"}>
                    <Flex
                        w={"100%"}
                        h={"100%"}
                        direction={"row"}
                        justify={"space-between"}
                        align={"center"}
                        wrap={"nowrap"}
                    >
                        <Text
                            fw={700}
                            fz={"xl"}
                            variant={"gradient"}
                            gradient={{ from: "#005bea", to: "#00c6fb" }}
                            sx={{ userSelect: "none" }}
                        >
                            จำลองความสัมพันธ์
                        </Text>
                        <Group position="center" spacing={"md"}>
                            <Text>{hasHydrated && (getUser?.first_name && firstNameUser)} {hasHydrated && (getUser?.last_name && lastNameUser)}</Text>
                            <Button
                                variant={"light"}
                                onClick={open}
                            >
                                <IconSettings size={18} />
                                &nbsp;
                                แก้ไขข้อมูล
                            </Button>
                            <Button
                                color={"red"}
                                loading={isLogout}
                                onClick={LogoutHandler}
                            >
                                <IconLogout size={18} />
                                &nbsp;
                                ออกจากระบบ
                            </Button>
                        </Group>
                    </Flex>
                </Container>
            </Flex>
            <Container mt={24} w={"100%"} h={"auto"} maw={"1152px"}>
                <Flex
                    w={"100%"}
                    h={"auto"}
                    direction={"column"}
                    gap={"xl"}
                    align={"start"}
                    wrap={"wrap"}
                >
                    {children}
                </Flex>
            </Container>
        </>
    );
}
