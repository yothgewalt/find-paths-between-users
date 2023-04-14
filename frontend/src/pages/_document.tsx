import Document, { Html, Head, Main, NextScript } from "next/document";
import { createGetInitialProps } from "@mantine/next";

const getInitialProps = createGetInitialProps();

export default class Customized extends Document {
    static getInitialProps = getInitialProps;

    render(): JSX.Element {
        return (
            <Html lang="th">
                <Head />
                <body className="relative antialiased box-border text-white overflow-hidden">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
