import React from "react";
import Image from "next/image";
import { Flex, Grid } from "@mantine/core";

import RichardHorvathUnplashImage from "./../../../public/static/richard-horvath-unsplash.jpg";

export default function IdentifyPageLayout({
    children,
}: React.PropsWithChildren) {
    return (
        <Grid
            sx={{
                width: "100%",
                height: "100vh",
                margin: "0",
            }}
        >
            <Grid.Col span={3} sx={{ overflow: "hidden", maxWidth: 480 }}>
                <Flex
                    w={"100%"}
                    h={"100%"}
                    direction={"column"}
                    justify={"center"}
                    align={"center"}
                    wrap={"nowrap"}
                >
                    {children}
                </Flex>
            </Grid.Col>
            <Grid.Col span={9} sx={{ padding: "0", overflow: "hidden" }}>
                <Image
                    className="h-full w-full object-cover object-center min-h-full"
                    src={RichardHorvathUnplashImage}
                    alt="static background"
                    priority
                />
            </Grid.Col>
        </Grid>
    );
}
