/// Deploys the package using the deployer private key provided in .env
/// Transfers package upgrade cap to the deployer
/// Writes the deployment details to deployment.json
import path from "path";
import { execSync } from "child_process";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  ENV,
  getCreatedObjectsIDs,
  getKeyPairFromPvtKey,
  readJSONFile,
  signAndExecuteTxBlock,
  writeJSONFile,
} from "./utils";

async function main() {
  const deployer = getKeyPairFromPvtKey(ENV.DEPLOYER_KEY, ENV.WALLET_SCHEME);
  const deployerAddress = deployer.getPublicKey().toSuiAddress();
  console.log(`Deploying to: ${ENV.DEPLOY_ON}`);
  console.log(`Deployer: ${deployerAddress}`);

  const pkgPath = path.join(path.resolve(__dirname), "../");
  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({ modules, dependencies });
  tx.transferObjects([upgradeCap], tx.pure(deployerAddress));
  console.log("Deploying");
  let result = await signAndExecuteTxBlock(tx, deployer);
  result.objectChanges;
  const objects = getCreatedObjectsIDs(result);
  console.dir(objects, null);

  // update deployment file
  const filePath = "./deployment.json";
  const deployment = readJSONFile(filePath);
  deployment[ENV.DEPLOY_ON] = objects;
  writeJSONFile(filePath, deployment);
}

main();
