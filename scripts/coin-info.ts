import { INTERACTOR, SUI_CLIENT } from "../env";
import { BLUE_TOKEN_DECIMALS } from "../utils";
import { toBaseNumber } from "../utils";

async function main() {
  // total supply
  const supply = await SUI_CLIENT.getTotalSupply({
    coinType: INTERACTOR.getCoinType(),
  });
  console.log(
    `Total supply of BLUE: ${toBaseNumber(supply.value, BLUE_TOKEN_DECIMALS)}`
  );

  //metadata
  const metadata = await SUI_CLIENT.getCoinMetadata({
    coinType: INTERACTOR.getCoinType(),
  });
  console.log("BLUE coin metadata");
  console.dir(metadata, null);
}
main();
