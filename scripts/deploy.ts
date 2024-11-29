/// Deploys the package using the deployer private key provided in .env
/// Transfers package upgrade cap to the deployer
/// Writes the deployment details to deployment.json
import path from "path";
import { execSync } from "child_process";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  getCreatedObjectsIDs,
  readJSONFile,
  signAndExecuteTxBlock,
  writeJSONFile,
} from "../utils";
import { ADMIN, ENV, SUI_CLIENT } from "../env";

async function main() {
  console.log(`Deploying to: ${ENV.DEPLOY_ON}`);
  console.log(`Deployer: ${ADMIN.toSuiAddress()}`);

  const pkgPath = path.join(path.resolve(__dirname), "../");
  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({ modules, dependencies });
  tx.transferObjects([upgradeCap], tx.pure(ADMIN.toSuiAddress()));
  console.log("Deploying");
  let result = await signAndExecuteTxBlock(tx, ADMIN, SUI_CLIENT);
  result.objectChanges;
  const objects = getCreatedObjectsIDs(result);

  objects["BasePackage"] = objects["Package"]; // always store the address of base package separately

  console.dir(objects, null);

  // update deployment file
  const filePath = "./deployment.json";
  const deployment = readJSONFile(filePath);
  deployment[ENV.DEPLOY_ON] = objects;
  writeJSONFile(filePath, deployment);
}

main();
