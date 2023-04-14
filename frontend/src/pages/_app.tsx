import "./../styles/globals.css";

import React from "react";

import type { AppProps } from "next/app";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { useUserStore } from "@context/user_context";
import { userInteractionServices } from "@services/user_interaction";
import { useRouter } from "next/router";
import { RouterTransition } from "@components/core";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const setUser = useUserStore((state) => state.setUser);

    const fetchUser = React.useCallback(async () => {
        try {
            const responseUser = await userInteractionServices.getUserInformation();
            if (responseUser?.status_code == 200) {
                setUser(responseUser.data);
            }

        } catch (error) {
            localStorage.removeItem("authentication_token");
            setUser(undefined);

            console.error("Failed to fetch user data:", (error as any).message);
        }

    }, [setUser]);

    React.useEffect(() => {
        const handleRouteChange = async () => {
            await router.isReady;
            fetchUser();
        };

        router.events.on("routeChangeComplete", handleRouteChange);

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        };
    }, [router, fetchUser]);

    return (
        <>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    fontFamily: "Seed Sans",
                    colorScheme: "dark",
                }}
            >
                <RouterTransition />
                <Notifications position="top-right" />
                <Component {...pageProps} />
            </MantineProvider>
        </>
    );
}
