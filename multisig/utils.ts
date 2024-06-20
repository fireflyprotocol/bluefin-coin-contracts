const fs = require("fs");
const path = require("path");
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { fromB64, toB64 } from "@mysten/sui.js/utils";
import { ENV, SUI_CLIENT, readJSONFile } from "../scripts/utils";
import { execSync } from "child_process";
import { Keypair, SignatureScheme } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";

export const DEPLOYMENT = readJSONFile("./multisig/deployment.json");
export const TARGET_DEPLOYMENT = DEPLOYMENT[ENV.DEPLOY_ON];

export function readFile(filePath: string): any {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

export const MS_WALLET = readFile(path.join(__dirname, "./wallet.json"));

export async function createMsTxBytes(txb: TransactionBlock): Promise<string> {
  txb.setSender(MS_WALLET.multisigAddress);
  return toB64(
    await txb.build({ client: SUI_CLIENT, onlyTransactionKind: false })
  );
}

export function execCommand(command: string) {
  return execSync(command, { encoding: "utf-8" });
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
    case "ZkLogin":
      return Ed25519Keypair.fromSecretKey(fromB64(key));
    default:
      throw new Error("Provided key is invalid");
  }
}

export function combineMSTx(signatures: string[], suiMultiSig: any) {
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

export const MULTI_SIG_WALLET = readFile(path.join(__dirname, "./wallet.json"));
