/// Allows the holder of Treasury Cap to wrap it into `TreasuryCapHolder` object
import { ENV, INTERACTOR } from "../env";
import { getCreatedObjectsIDs, readJSONFile, writeJSONFile } from "../utils";

async function main() {
  const txResponse = await INTERACTOR.wrap();

  const holder = getCreatedObjectsIDs(txResponse);

  console.log(JSON.stringify(txResponse));

  const filePath = "./deployment.json";
  const deployment = readJSONFile(filePath);
  deployment[ENV.DEPLOY_ON]["TreasuryCapHolder"] = holder["TreasuryCapHolder"];

  writeJSONFile(filePath, deployment);

}

main();
