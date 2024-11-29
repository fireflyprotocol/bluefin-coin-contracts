import BigNumber from "bignumber.js";

export type DeployOn = "localnet" | "mainnet" | "testnet" | "devnet";
export type BigNumberable = BigNumber | number | string;
export type MultiSigOwner = { address: string, publicBase64Key: string, weight: number };
export type MultiSigWallet = { multisigAddress: string, multisig: Array<MultiSigOwner>, threshold: number};
