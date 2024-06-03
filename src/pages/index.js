import Head from "next/head";
import { Inter } from "next/font/google";
import Dex from "./components/Dex";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>NutSwap</title>
        <meta name="description" content="A dex built with precision by NUTCOIN" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Dex />
      </main>
    </>
  );
}
