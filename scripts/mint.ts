/// Mints the coins and transfers to given address
/// Assumes that DEPLOYER_KEY in .env file has the TreasuryCap

import { ENV, SUI_CLIENT, TARGET_DEPLOYMENT } from "./utils";
import { Interactor, getKeyPairFromPvtKey, sleep } from "./utils";

async function main() {
  const admin = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);
  const interactor = new Interactor(SUI_CLIENT, TARGET_DEPLOYMENT, admin);

  const coinsToMint = 10_000;
  const sendTo =
    "0x80c3d285c2fe5ccacd1a2fbc1fc757cbeab5134f1ef1e97803fe653e041c88aa";

  console.log(`Admin address: ${admin.toSuiAddress()}`);

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
