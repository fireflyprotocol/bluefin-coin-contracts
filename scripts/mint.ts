/// Mints the coins and transfers to given address
/// Assumes that DEPLOYER_KEY in .env file has the TreasuryCap

import {
  ENV,
  Interactor,
  SUI_CLIENT,
  getKeyPairFromPvtKey,
  TARGET_DEPLOYMENT,
  sleep,
} from "./utils";

async function main() {
  const admin = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);
  const interactor = new Interactor(SUI_CLIENT, TARGET_DEPLOYMENT, admin);

  const coinsToMint = 50;

  console.log(`Admin address: ${admin.toSuiAddress()}`);

  console.log(`Initial BLUE balance: ${await interactor.getBLUEBalance()}`);

  console.log(`Minting BLUE Tokens: ${coinsToMint}`);
  await interactor.mint(coinsToMint);

  // chain state often doesn't so fast
  await sleep(1000);
  console.log(`Current BLUE balance: ${await interactor.getBLUEBalance()}`);
}

main();
