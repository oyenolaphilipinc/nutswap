import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TonConnectUIProvider, THEME } from "@tonconnect/ui-react";


const manifestUrl =
  "https://raw.githubusercontent.com/Draysongz/nutswap/main/public/manifest.json";
export default function App({ Component, pageProps }) {
  return (
    <>
     <TonConnectUIProvider 
     manifestUrl={manifestUrl} 
     uiPreferences={{
      theme: 'SYSTEM',
       colorsSet:{
        [THEME.DARK]: {
          connectButton:{
            background: 'transparent',
            foreground: 'white',
            border: '1px solid red'
          }
        }
      }
     }
     }>
    <ChakraProvider>
    <Component {...pageProps} />
    </ChakraProvider>
    </TonConnectUIProvider>
    </>
  );
}
