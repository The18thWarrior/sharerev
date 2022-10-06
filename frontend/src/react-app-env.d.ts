/// <reference types="react-scripts" />
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window{
    ethereum?:any
  }
}

declare module '*.png';
declare module '*.svg';
declare module '*.gif';
declare module '*.ico';