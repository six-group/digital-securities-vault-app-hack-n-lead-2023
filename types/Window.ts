import { MetaMaskInpageProvider } from "@metamask/providers";

// this is helps with an ESLint error that window.ethereum
// is undefined. Ultimately, a better solution is needed here.
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
