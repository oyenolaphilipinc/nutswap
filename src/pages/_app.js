import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";


const manifestUrl =
  "https://raw.githubusercontent.com/Draysongz/nutswap/main/public/manifest.json";
export default function App({ Component, pageProps }) {
  return (
    <>
     <TonConnectUIProvider manifestUrl={manifestUrl}>
    <ChakraProvider>
    <Component {...pageProps} />
    </ChakraProvider>
    </TonConnectUIProvider>
    </>
  );
}
