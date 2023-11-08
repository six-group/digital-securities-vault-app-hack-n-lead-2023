import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import theme from "../helpers/theme";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // call the init endpoint at app start
  useEffect(() => {
    fetch("/api/init");
  }, []);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/ethereum.svg" />
        <title>SDX DSV</title>
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}
