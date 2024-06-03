import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
    <Component {...pageProps} />
    </ChakraProvider>
  );
}
