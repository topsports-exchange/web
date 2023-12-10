import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
// base
// import { Client as Styletron } from 'styletron-engine-monolithic';
import { styletron } from "../styletron";
import localFont from "@next/font/local";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
// import { LightTheme, BaseProvider, styled } from 'baseui';
import { BaseProvider, LightTheme } from "baseui";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { Provider as StyletronProvider } from "styletron-react";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

const poppins = localFont({
  src: [
    {
      path: "../public/fonts/Exo_2/static/Exo2-Regular.ttf",
      weight: "400",
    },
    {
      path: "../public/fonts/Exo_2/static/Exo2-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-exo_2",
});
// import { StatefulInput } from 'baseui/input';

// const engine = new Styletron();

// const Centered = styled('div', {
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   height: '100%',
// });

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? lightTheme() : lightTheme()}
      >
        {/* <div className={`${poppins.variable} font-sans flex flex-col min-h-screen`}>
          <main className="relative flex flex-col flex-1">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div> */}
        <Toaster />
        <StyletronProvider value={styletron}>
          <BaseProvider theme={LightTheme}>
            {/* <Centered> */}
            {/* <StatefulInput /> */}
            <div className={`${poppins.variable} font-sans flex flex-col min-h-screen bg-gray-950 text-white`}>
              <Header />
              <main className="relative flex flex-col flex-1">
                <Component {...pageProps} />
              </main>
              {/* <Footer /> */}
            </div>
            <Toaster />
            {/* </Centered> */}
          </BaseProvider>
        </StyletronProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
