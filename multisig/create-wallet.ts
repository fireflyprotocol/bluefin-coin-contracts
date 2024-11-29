
import { execCommand, getKeyPairFromSeed, getPublicKey, TEST_WALLETS } from "../utils";

function createMultiSigWallet(adminPKs: string[], threshold: number) {
  if (threshold > adminPKs.length)
    throw "Threshold must be < number of admin keys";

  if (adminPKs.length > 10) throw "Max number of keys allowed are 10";

  const walletDetails = JSON.parse(
    execCommand(
      `sui keytool --json multi-sig-address --pks ${adminPKs.join(
        " "
      )} --weights ${new Array(adminPKs.length)
        .fill(1)
        .join(" ")} --threshold ${threshold}`
    )
  );

  walletDetails["threshold"] = threshold;
  return walletDetails;
}

async function main() {
  const adminPublicKeys = [
    getPublicKey(getKeyPairFromSeed(TEST_WALLETS[0].phrase)),
    getPublicKey(getKeyPairFromSeed(TEST_WALLETS[1].phrase)),
    getPublicKey(getKeyPairFromSeed(TEST_WALLETS[2].phrase)),
  ];

  const ms = createMultiSigWallet(adminPublicKeys, 2);

  console.log(JSON.stringify(ms));
}
main();
