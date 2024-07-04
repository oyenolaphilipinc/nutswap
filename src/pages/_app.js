import "@/styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { TonConnectUIProvider, THEME } from "@tonconnect/ui-react";
import { ToastContainer } from "react-toastify";
import "@fontsource/urbanist"


const manifestUrl =
  "https://raw.githubusercontent.com/Draysongz/nutswap/main/public/manifest.json";


  const theme = extendTheme({
  fonts: {
    heading: `'urbanist', sans-serif`,
    body: `'urbanist', sans-serif`,
  },
});
export default function App({ Component, pageProps }) {
  return (
    <>
     <TonConnectUIProvider 
     manifestUrl={manifestUrl} 
     uiPreferences={{
      theme: 'DARK',
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
    <ChakraProvider theme={theme}>
    <Component {...pageProps} />
    <ToastContainer />
    </ChakraProvider>
    </TonConnectUIProvider>
    </>
  );
}
