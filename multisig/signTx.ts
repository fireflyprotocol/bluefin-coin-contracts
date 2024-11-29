import {
    getKeyPairFromPvtKey,
    getKeyPairFromSeed,
    signMultiSigTx,
  } from "../utils";
  import { fromB64 } from "@mysten/sui.js/utils";
  
  async function main() {
    const txBytes =
      "AAACAQD8lTi/HGBbFYtlG3fXIOtCBSD0ToaOPwyhPpqk/XRVBFzhHxIAAAAAIAiYVrYhSk9ix2B/xZsJEx9uufR+SpFe9oRjL+NFRe4DACAhg99ar2Nm5URclfojj8Ij272lS3w2NoBXi0NfZX8aKQEBAQEAAAEBAAvy0ItWR+mLUi0uwh9dPDpvG16YEUSWmcUMzYjWG4Z7AXgD1Skg3aIPNhyhCnk3TQfPvovUxt5e69Sh3JXfWcW8XeEfEgAAAAAgDnnhqnS0XLq0vUsNeYSVjWUnAMzCdfwS5RdyazcfL1IL8tCLVkfpi1ItLsIfXTw6bxtemBFElpnFDM2I1huGe+4CAAAAAAAAlDYmAAAAAAAA";
  
    const signerConfig = {
      use: "phrase", // "cli" | "phrase" | "pvt_key_hex" | "pvt_key_base64"
      // when using cli in details just provide the address
      // details: {
      //   address:
      //     "0x6c61e48381f07de099f4feb4395db0a32a242b05fa79ab97d8f9e09e6ddbf980",
      // },
  
      // when using phrase provide the phrase itself and scheme
      details: {
        phrase:
          "trim basket bicycle ticket penalty window tunnel fit insane orange virtual tennis",
        scheme: "Secp256k1", // | "ED25519"
      },
  
      // when using private key hex, provide the key and scheme
      // details: {
      //   pvtKey:
      //     "0292acaff05638da2c607adac4da89bc1fa0351be66b6ca6c532bc950aaae739",
      //   scheme: "Secp256k1", // | "ED25519"
      // },
  
      // when using private key base64, provide just the key
      // details: {
      //   pvtKey: "AQKSrK/wVjjaLGB62sTaibwfoDUb5mtspsUyvJUKquc5",
      // },
    };
  
    switch (signerConfig.use) {
      case "cli":
        const signature = signMultiSigTx(
          txBytes,
          (signerConfig.details as any).address
        );
        console.log({ signature });
        break;
      case "phrase": {
        const keyPair = getKeyPairFromSeed(
          (signerConfig.details as any).phrase,
          (signerConfig.details as any).scheme
        );
        const sig = await keyPair.signWithIntent(fromB64(txBytes), 0);
        console.log({ signature: sig.signature });
        break;
      }
      case "pvt_key_hex": {
        const keyPair = getKeyPairFromPvtKey(
          (signerConfig.details as any).pvtKey,
          (signerConfig.details as any).scheme
        );
        const sig = await keyPair.signWithIntent(fromB64(txBytes), 0);
        console.log({ signature: sig.signature });
        break;
      }
      case "pvt_key_base64": {
        const key = Array.from(fromB64((signerConfig.details as any).pvtKey));
        const scheme = key.shift() == 0 ? "ED25519" : "Secp256k1";
        const hexPvtKey = Buffer.from(key).toString("hex");
  
        const keyPair = getKeyPairFromPvtKey(hexPvtKey, scheme);
        const sig = await keyPair.signWithIntent(fromB64(txBytes), 0);
        console.log({ signature: sig.signature });
        break;
      }
  
      default:
        throw "Unknown signer unconfig type";
    }
  }
  
  main();