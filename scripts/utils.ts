import { config } from "dotenv";
import { SignatureScheme, Keypair } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";
import fs from "fs";

import {
  SuiClient,
  SuiObjectChange,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/dist/cjs/builder";

config({ path: ".env" });

export type DeployOn = "localnet" | "mainnet" | "testnet";

export const ENV = {
  DEPLOY_ON: process.env.DEPLOY_ON as DeployOn,
  DEPLOYER_KEY: process.env.DEPLOYER_KEY || "0x",
  // defaults wallet scheme to secp256k1
  WALLET_SCHEME: (process.env.WALLET_SCHEME || "Secp256k1") as SignatureScheme,
};

export const SUI_CLIENT = new SuiClient({
  url:
    ENV.DEPLOY_ON == "mainnet"
      ? "https://fullnode.mainnet.sui.io:443"
      : ENV.DEPLOY_ON == "testnet"
      ? "https://fullnode.testnet.sui.io:443"
      : "http://0.0.0.0:9000",
});

/// converts private key into KeyPair
export function getKeyPairFromPvtKey(
  key: string,
  scheme: SignatureScheme = "Secp256k1"
): Keypair {
  if (key.startsWith("0x")) {
    key = key.substring(2); // Remove the first two characters (0x)
  }
  switch (scheme) {
    case "ED25519":
      return Ed25519Keypair.fromSecretKey(Buffer.from(key, "hex"));
    case "Secp256k1":
      return Secp256k1Keypair.fromSecretKey(Buffer.from(key, "hex"));
    default:
      throw new Error("Provided key is invalid");
  }
}

/// signs and executes the provided sui transaction block
export async function signAndExecuteTxBlock(
  transactionBlock: TransactionBlock,
  signer: Keypair,
  suiClient?: SuiClient,
  options: SuiTransactionBlockResponseOptions = {
    showObjectChanges: true,
    showEffects: true,
    showEvents: true,
    showInput: true,
  }
): Promise<SuiTransactionBlockResponse> {
  const client = suiClient || SUI_CLIENT;
  transactionBlock.setSenderIfNotSet(signer.toSuiAddress());
  const builtTransactionBlock = await transactionBlock.build({
    client,
  });

  const transactionSignature = await signer.signTransactionBlock(
    builtTransactionBlock
  );

  return client.executeTransactionBlock({
    transactionBlock: builtTransactionBlock,
    signature: transactionSignature.signature,
    options,
  });
}

export interface ObjectsMap {
  [object: string]: string;
}

export function getCreatedObjectsIDs(
  txResponse: SuiTransactionBlockResponse
): ObjectsMap {
  const objects: ObjectsMap = {};

  for (const object of txResponse.objectChanges as SuiObjectChange[]) {
    if (object.type == "mutated") continue;
    // only Packages get published
    if (object.type == "published") {
      objects["Package"] = object.packageId;
    } else if (object.type == "created") {
      const type = (
        object.objectType
          .replace(/\s*\<.*?\>\s*/g, "")
          .match(/^(?<pkg>[\w]+)::(?<mod>[\w]+)::(?<type>[\w]+)$/)
          ?.groups as any
      )["type"];
      objects[type] = object.objectId;
    }
  }

  return objects;
}

export function readJSONFile(filePath: string) {
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath).toString())
    : {};
}

export function writeJSONFile(filePath: string, content: JSON) {
  fs.writeFileSync(filePath, JSON.stringify(content));
}
