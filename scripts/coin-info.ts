import {
  SUI_CLIENT,
  TARGET_DEPLOYMENT,
  toBaseNumber,
  BLUE_TOKEN_DECIMALS,
} from "./utils";

async function main() {
  // total supply
  const supply = await SUI_CLIENT.getTotalSupply({
    coinType: `${TARGET_DEPLOYMENT.Package}::coin::COIN`,
  });
  console.log(
    `Total supply of BLUE: ${toBaseNumber(supply.value, BLUE_TOKEN_DECIMALS)}`
  );

  //metadata
  const metadata = await SUI_CLIENT.getCoinMetadata({
    coinType: `${TARGET_DEPLOYMENT.Package}::coin::COIN`,
  });
  console.log("BLUE coin metadata");
  console.dir(metadata, null);
}
main();
