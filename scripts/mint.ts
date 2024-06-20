/// Mints the coins and transfers to given address
/// Assumes that DEPLOYER_KEY in .env file has the TreasuryCap

import { ENV, SUI_CLIENT, TARGET_DEPLOYMENT } from "./utils";
import { Interactor, getKeyPairFromPvtKey, sleep } from "./utils";

async function main() {
  const admin = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);
  const interactor = new Interactor(SUI_CLIENT, TARGET_DEPLOYMENT, admin);

  const coinsToMint = 10_000;
  const sendTo =
    "0x3a47eb941c01e49a4f68af79d43009771b99d96c92a3ff75a775389e30550adc";

  console.log(`Admin address: ${admin.toSuiAddress()}`);
  console.log(`Sending To: ${sendTo}`);

  console.log(
    `Initial BLUE balance: ${await interactor.getBLUEBalance(sendTo)}`
  );

  console.log(`Minting BLUE Tokens: ${coinsToMint}`);
  const tx = await interactor.mint(coinsToMint, sendTo);

  // chain state often doesn't so fast
  await sleep(1000);
  console.log(
    `Current BLUE balance: ${await interactor.getBLUEBalance(sendTo)}`
  );
}

main();
