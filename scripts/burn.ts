/// Mints the coins and transfers to given address
/// Assumes that DEPLOYER_KEY in .env file has the TreasuryCap

import {
  ENV,
  Interactor,
  SUI_CLIENT,
  getCreatedObjectsIDs,
  getKeyPairFromPvtKey,
  readJSONFile,
  sleep,
} from "./utils";

async function main() {
  const deployment = readJSONFile("./deployment.json");
  const admin = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);
  const interactor = new Interactor(
    SUI_CLIENT,
    deployment[ENV.DEPLOY_ON],
    admin
  );

  const coinsToBurn = 75;

  console.log(`Admin address: ${admin.toSuiAddress()}`);

  console.log(`Initial BLUE balance: ${await interactor.getBLUEBalance()}`);

  // merge all coins if multiple
  try {
    await interactor.mergeBLUECoins();
  } catch (e) {}

  // make a coin equal to the amount we want to burn
  await interactor.splitCoin(coinsToBurn);

  console.log(`Burning BLUE Tokens: ${coinsToBurn}`);
  await interactor.burn(coinsToBurn);

  // chain state often doesn't so fast
  await sleep(1000);
  console.log(`Current BLUE balance: ${await interactor.getBLUEBalance()}`);
}

main();
