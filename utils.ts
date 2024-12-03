import { SignatureScheme, Keypair } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";
import { toB64 } from "@mysten/sui.js/utils";

import fs from "fs";

import {
  CoinStruct,
  DryRunTransactionBlockResponse,
  PaginatedCoins,
  SuiClient,
  SuiObjectChange,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import BigNumber from "bignumber.js";
import { execSync } from "child_process";
import { BigNumberable, MultiSigWallet } from "./types";


export const BLUE_TOKEN_DECIMALS = 9;


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

export function getKeyPairFromSeed(
  seed: string,
  scheme: SignatureScheme = "Secp256k1"
): Keypair {
  switch (scheme) {
    case "ED25519":
      return Ed25519Keypair.deriveKeypair(seed);
    case "Secp256k1":
      return Secp256k1Keypair.deriveKeypair(seed);
    default:
      throw new Error("Provided scheme is invalid");
  }
}


/**
   * Executes dry run for the given tx block
   * @param txBlock Sui transaction block
   * @param signer The signer that will be singing the Tx
   * @param suiClient The sui client to be used
   * @returns Sui Transaction Block Response
   */
export async function dryRunTxBlock(
  txBlock: TransactionBlock,
  signer: any,
  client: SuiClient,
): Promise<DryRunTransactionBlockResponse> {
  
  txBlock.setSenderIfNotSet(signer.toSuiAddress());

  const builtBlock = await txBlock.build({
    client
  });

  return client.dryRunTransactionBlock({
      transactionBlock: builtBlock
  });
}


/// signs and executes the provided sui transaction block
export async function signAndExecuteTxBlock(
  transactionBlock: TransactionBlock,
  signer: Keypair,
  client: SuiClient,
  options: SuiTransactionBlockResponseOptions = {
    showObjectChanges: true,
    showEffects: true,
    showEvents: true,
    showInput: true,
  }
): Promise<SuiTransactionBlockResponse> {
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



export async function createMsTxBytes(client: SuiClient, txb: TransactionBlock, msWallet: string): Promise<string> {
  txb.setSender(msWallet);
  return toB64(
    await txb.build({ client, onlyTransactionKind: false })
  );
}

export function execCommand(command: string) {
  return execSync(command, { encoding: "utf-8" });
}


export const TEST_WALLETS = [
  {
    phrase:
      "trim bicycle fit ticket penalty basket window tunnel insane orange virtual tennis",
    address:
      "0x80c3d285c2fe5ccacd1a2fbc1fc757cbeab5134f1ef1e97803fe653e041c88aa",
  },
  {
    phrase:
      "trim basket bicycle fit ticket penalty window tunnel insane orange virtual tennis",
    address:
      "0x2183df5aaf6366e5445c95fa238fc223dbbda54b7c363680578b435f657f1a29",
  },
  {
    phrase:
      "trim basket bicycle ticket penalty window tunnel fit insane orange virtual tennis",
    address:
      "0xed2bb2ae1330a3abee7794e659add176b827e13532b31074ad01330df2d5c843",
  },
];

export function getPublicKey(keyPair: Keypair): string {
  return keyPair.getPublicKey().toSuiPublicKey();
}

export function signMultiSigTx(txBytes: string, signer: string) {
  return JSON.parse(
    execCommand(`sui keytool --json sign --address ${signer} --data ${txBytes}`)
  ).suiSignature;
}

export function combineMSTx(signatures: string[], suiMultiSig: MultiSigWallet) {
  let pks = "";
  let weights = "";
  for (const multisig of suiMultiSig.multisig) {
    pks += " " + multisig.publicBase64Key;
    weights += " " + multisig.weight;
  }

  return JSON.parse(
    execCommand(
      `sui keytool --json multi-sig-combine-partial-sig --pks ${pks} --weights ${weights} --threshold ${
        suiMultiSig.threshold
      } --sigs ${signatures.join(" ")}`
    )
  );
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
        txb.object(this.deployment.TreasuryCapHolder),
        txb.pure(toBigNumberStr(amount, BLUE_TOKEN_DECIMALS)),
        txb.pure(to || this.signer.toSuiAddress()),
      ],
      target: `${this.deployment.Package}::blue::mint_tokens`,
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
        txb.object(this.deployment.TreasuryCapHolder),
        txb.object(coin.coinObjectId),
      ],
      target: `${this.deployment.Package}::blue::burn_tokens`,
    });

    txb.setSender(this.signer.toSuiAddress());

    return signAndExecuteTxBlock(txb, this.signer, this.suiClient);
  }


  /**
   * Allows Treasury Cap holder of the wrap it into `TreasuryCapHolder` object
   * @returns SuiTransactionBlockResponse
   */
  public async wrap(
  ): Promise<SuiTransactionBlockResponse> {
    const txb = new TransactionBlock();

    txb.moveCall({
      arguments: [
        txb.object(this.deployment.TreasuryCap),
      ],
      target: `${this.deployment.Package}::blue::wrap_treasury_cap`,
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
    const coins = await this.getBLUECoins(address);

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
    const coins = await this.getBLUECoins(address);

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

