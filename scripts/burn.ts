/// Mints the coins and transfers to given address
/// Assumes that DEPLOYER_KEY in .env file has the TreasuryCap

import { ADMIN, INTERACTOR } from "./utils";
import { sleep } from "./utils";

async function main() {
  const coinsToBurn = 75;

  console.log(`Admin address: ${ADMIN.toSuiAddress()}`);

  console.log(`Initial BLUE balance: ${await INTERACTOR.getBLUEBalance()}`);

  // merge all coins if multiple
  try {
    await INTERACTOR.mergeBLUECoins();
  } catch (e) {}

  // make a coin equal to the amount we want to burn
  await INTERACTOR.splitCoin(coinsToBurn);

  console.log(`Burning BLUE Tokens: ${coinsToBurn}`);
  await INTERACTOR.burn(coinsToBurn);

  // chain state often doesn't so fast
  await sleep(1000);
  console.log(`Current BLUE balance: ${await INTERACTOR.getBLUEBalance()}`);
}

main();
