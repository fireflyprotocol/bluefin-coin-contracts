import {
  getKeyPairFromPvtKey,
  getKeyPairFromSeed,
  signMultiSigTx,
} from "./utils";
import { fromB64 } from "@mysten/sui.js/utils";

async function main() {
  const txBytes =
    "AAABACDKniBWBE4S3czHYujwZhqKYO4Z5n+VovAA+lMqY8OvpAIEAbwHoRzrCwYAAAAKAQAMAgwkAzBDBHMOBYEBkAEHkQLyAQiDBGAG4wTAAQqjBgUMqAZjAAcBEAIJAhYCFwIYAAACAAEDBwEAAAIBDAEAAQICDAEAAQIEDAEAAQQFAgAFBgcAAAwAAQAADQIBAAAIAwEAARQHCAEAAggUEgEAAgoKCwECAg4TAQEAAhUREgEAAxEHAQEMAxIQAQEMBBMNDgAFDwUGAAMGBQkIDAkPBwkGCQQJAggABwgFAAQHCwQBCAADBQcIBQIHCwQBCAALAgEIAAILAwEIAAsEAQgAAQoCAQgGAQkAAQsBAQkAAQgABwkAAgoCCgIKAgsBAQgGBwgFAgsEAQkACwMBCQABCwMBCAABBggFAQUBCwQBCAACCQAFAQYLBAEJAAEDBAcLBAEJAAMFBwgFAgcLBAEJAAsCAQkABEJMVUUEQ29pbgxDb2luTWV0YWRhdGEGT3B0aW9uC1RyZWFzdXJ5Q2FwCVR4Q29udGV4dANVcmwEYmx1ZQRidXJuBGNvaW4PY3JlYXRlX2N1cnJlbmN5C2R1bW15X2ZpZWxkBGluaXQEbWludBFtaW50X2FuZF90cmFuc2ZlchVuZXdfdW5zYWZlX2Zyb21fYnl0ZXMGb3B0aW9uFHB1YmxpY19mcmVlemVfb2JqZWN0D3B1YmxpY190cmFuc2ZlcgZzZW5kZXIEc29tZQx0b3RhbF9zdXBwbHkIdHJhbnNmZXIKdHhfY29udGV4dAN1cmwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDCAAAZKeztuANAwgBAAAAAAAAAAoCBQRCTFVFCgIIB0JsdWVmaW4KAm5tQmx1ZWZpbiBmb3VuZGF0aW9uIGNvaW4gZWFybmVkIGJ5IHRyYWRpbmcgb24gdGhlIEJsdWVmaW4gcHJvdG9jb2wgYW5kIHVzZWQgdG8gcGFydGFrZSBpbiBnb3Zlcm5hbmNlIHByb3Bvc2FscwoCJSRodHRwczovL2JsdWVmaW4uaW8vaW1hZ2VzL3NxdWFyZS5wbmcAAgELAQAAAAAEFAsAMQkHAgcDBwQHBRELOAAKATgBDAIMAwsCOAILAwsBLhEKOAMCAQEEAAEVCgAuOAQKARYHACUECQUPCwABCwMBBwEnCwALAQsCCwM4BQICAQQAAQULAAsBOAYBAgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEBAwAAAAABAADKniBWBE4S3czHYujwZhqKYO4Z5n+VovAA+lMqY8OvpAFRaedO3f2NMJtpb+9x11fZ8VSeY7gNyd/bMNhUbgMQnC1DCgAAAAAAILKQvudhJSYPsLleMm+dOCSjSl+2xODDCZ4vOCJGXCWkyp4gVgROEt3Mx2Lo8GYaimDuGeZ/laLwAPpTKmPDr6ToAwAAAAAAAEBTGwEAAAAAAA==";

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
