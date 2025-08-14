import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "../utils/wdyr"; // Import WDYR before any other imports

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
