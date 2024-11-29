import { SignatureScheme } from "@mysten/sui.js/cryptography";
import { config } from "dotenv";
import {
    SuiClient,
  } from "@mysten/sui.js/client";
import { getKeyPairFromPvtKey, getKeyPairFromSeed, Interactor, readJSONFile } from "./utils";
import { DeployOn, MultiSigWallet } from "./types";

config({ path: ".env" });

export const ENV = {
  DEPLOY_ON: process.env.DEPLOY_ON as DeployOn,
  DEPLOYER_KEY: process.env.DEPLOYER_KEY || "0x",
  DEPLOYER_PHRASE: process.env.DEPLOYER_PHRASE || "0x",
  // defaults wallet scheme to secp256k1
  WALLET_SCHEME: (process.env.WALLET_SCHEME || "Secp256k1") as SignatureScheme,
};

export const SUI_CLIENT = new SuiClient({
    url:
      ENV.DEPLOY_ON == "mainnet"
        ? "https://fullnode.mainnet.sui.io:443"
        : ENV.DEPLOY_ON == "testnet"
        ? "https://fullnode.testnet.sui.io:443"
        : ENV.DEPLOY_ON == "devnet"
        ? "https://fullnode.devnet.sui.io:443"
        : "http://0.0.0.0:9000",
  });
  

export const DEPLOYMENT = readJSONFile(`${__dirname}/deployment.json`);

export const TARGET_DEPLOYMENT = DEPLOYMENT[ENV.DEPLOY_ON];

export const ADMIN = ENV.DEPLOYER_KEY != "0x" 
  ? getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME)
  : getKeyPairFromSeed(ENV.DEPLOYER_PHRASE, ENV.WALLET_SCHEME)


export const MULTI_SIG_WALLET = readJSONFile(`${__dirname}/multi-sig-wallet.json`) as MultiSigWallet;

export const INTERACTOR = new Interactor(SUI_CLIENT, TARGET_DEPLOYMENT, ADMIN);
