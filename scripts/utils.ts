import { SignatureScheme, Keypair } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";
import fs from "fs";

import {
  CoinStruct,
  PaginatedCoins,
  SuiClient,
  SuiObjectChange,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import BigNumber from "bignumber.js";

import { config } from "dotenv";

config({ path: ".env" });

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
      : ENV.DEPLOY_ON == "devnet"
      ? "https://fullnode.devnet.sui.io:443"
      : "http://0.0.0.0:9000",
});

export const BLUE_TOKEN_DECIMALS = 9;

export const DEPLOYMENT = readJSONFile("./deployment.json");
export const TARGET_DEPLOYMENT = DEPLOYMENT[ENV.DEPLOY_ON];

export const ADMIN = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);

export type DeployOn = "localnet" | "mainnet" | "testnet" | "devnet";
export type BigNumberable = BigNumber | number | string;

export function toBigNumber(val: BigNumberable, base: number): BigNumber {
  return new BigNumber(val).multipliedBy(new BigNumber(1).shiftedBy(base));
}

export function toBigNumberStr(val: BigNumberable, base: number): string {
  return toBigNumber(val, base).toFixed(0);
}

export function toBaseNumber(
  val: BigNumberable,
  base: number,
  decimals = 3
): number {
  return Number(new BigNumber(val).shiftedBy(-base).toFixed(decimals));
}

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
  try {
    return fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath).toString())
      : {};
  } catch (e) {
    return {};
  }
}

export function writeJSONFile(filePath: string, content: JSON) {
  fs.writeFileSync(filePath, JSON.stringify(content));
}

export class Interactor {
  suiClient: SuiClient;
  signer: Keypair;
  // TODO: define interface for deployment file
  deployment: any;

  constructor(_suiClient: SuiClient, _deployment: any, _signer?: Keypair) {
    this.suiClient = _suiClient;
    this.deployment = _deployment;
    // could be undefined, if initializing the interactor for only get calls
    this.signer = _signer as Keypair;
  }

  /**
   * Allows Treasury Cap holder of the coin to mint new coins
   * @param amount the amount to be minted
   * @param to (optional) the receiver of the coins. defaults to admin
   * @returns SuiTransactionBlockResponse
   */
  public async mint(
    amount: BigNumberable,
    to?: string
  ): Promise<SuiTransactionBlockResponse> {
    const txb = new TransactionBlock();

    txb.moveCall({
      arguments: [
        txb.object(this.deployment.TreasuryCap),
        txb.pure(toBigNumberStr(amount, BLUE_TOKEN_DECIMALS)),
        txb.pure(to || this.signer.toSuiAddress()),
      ],
      target: `${this.deployment.Package}::blue::mint`,
    });

    txb.setSender(this.signer.toSuiAddress());

    return signAndExecuteTxBlock(txb, this.signer, this.suiClient);
  }

  /**
   * Allows Treasury Cap holder of the coin to burn the coins
   * @param amount the amount to be burnt
   * @returns SuiTransactionBlockResponse
   */
  public async burn(
    amount: BigNumberable
  ): Promise<SuiTransactionBlockResponse> {
    const txb = new TransactionBlock();

    // the burn function will remove the entire coin object regardless
    // of the amount. We need to pass in the coin with exact amount
    const coin = await this.getBLUECoinsWithExactBalance(amount);

    txb.moveCall({
      arguments: [
        txb.object(this.deployment.TreasuryCap),
        txb.object(coin.coinObjectId),
      ],
      target: `${this.deployment.Package}::blue::burn`,
    });

    txb.setSender(this.signer.toSuiAddress());

    return signAndExecuteTxBlock(txb, this.signer, this.suiClient);
  }

  async mergeBLUECoins(): Promise<SuiTransactionBlockResponse> {
    const txb = new TransactionBlock();
    const coins = await this.getBLUECoins();

    if (coins.data.length <= 1) {
      throw "No coins available to merge";
    }

    const coinsIds = [];
    for (let i = 1; i < coins.data.length; i++) {
      coinsIds.push(coins.data[i].coinObjectId);
    }

    txb.mergeCoins(coins.data[0].coinObjectId, coinsIds);
    txb.setSender(this.signer.toSuiAddress());
    return signAndExecuteTxBlock(txb, this.signer, this.suiClient);
  }

  async splitCoin(amount: BigNumberable): Promise<SuiTransactionBlockResponse> {
    const txb = new TransactionBlock();
    const coins = await this.getBLUECoins();

    if (coins.data.length == 0) {
      throw "No coins available to split";
    }

    if (coins.data.length > 1) {
      throw "User has multiple coins, please merge all coins using `mergeBLUECoins` before splitting them";
    }

    const coinsId = coins.data[0].coinObjectId;

    const coin = txb.splitCoins(coinsId, [
      txb.pure(toBigNumberStr(amount, BLUE_TOKEN_DECIMALS)),
    ]);
    txb.transferObjects([coin], this.signer.toSuiAddress());

    txb.setSender(this.signer.toSuiAddress());
    return signAndExecuteTxBlock(txb, this.signer, this.suiClient);
  }

  /// Returns all blue coins that user holds
  async getBLUECoins(address?: string): Promise<PaginatedCoins> {
    const coins = await this.suiClient.getCoins({
      owner: address || this.signer.toSuiAddress(),
      coinType: this.getCoinType(),
    });
    return coins;
  }

  /// Returns the coin having balance >= provided amount
  public async getBLUECoinHavingBalance(
    amount: BigNumberable,
    address?: string
  ): Promise<CoinStruct> {
    address = address || this.signer.getPublicKey().toSuiAddress();
    // get all usdc coins
    const coins = await this.getBLUECoins();

    for (const coin of coins.data) {
      if (
        new BigNumber(coin.balance).gte(
          toBigNumber(amount, BLUE_TOKEN_DECIMALS)
        )
      ) {
        return coin;
      }
    }

    throw `User ${address} has no BLUE coin having balance: ${+amount}`;
  }

  /// Returns the coin having balance == provided amount
  public async getBLUECoinsWithExactBalance(
    amount: BigNumberable,
    address?: string
  ): Promise<CoinStruct> {
    address = address || this.signer.getPublicKey().toSuiAddress();
    // get all usdc coins
    const coins = await this.getBLUECoins();

    for (const coin of coins.data) {
      if (
        new BigNumber(coin.balance).eq(toBigNumber(amount, BLUE_TOKEN_DECIMALS))
      ) {
        return coin;
      }
    }

    throw `User ${address} has no BLUE coin having exact balance: ${+amount}`;
  }

  /// Returns the usdc balance of user (in base number, removes extra decimals)
  public async getBLUEBalance(address?: string): Promise<number> {
    const coins = await this.getBLUECoins(address);
    const bal = coins.data.reduce(
      (total: number, coin: any) => total + +coin.balance,
      0
    );

    return toBaseNumber(bal, BLUE_TOKEN_DECIMALS);
  }

  /// formulates the supported coin type
  getCoinType(): string {
    return `${this.deployment.BasePackage}::blue::BLUE`;
  }
}

export async function sleep(timeInMs: number) {
  await new Promise((resolve) => setTimeout(resolve, timeInMs));
}

export const INTERACTOR = new Interactor(SUI_CLIENT, TARGET_DEPLOYMENT, ADMIN);
