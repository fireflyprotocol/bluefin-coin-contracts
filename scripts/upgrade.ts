import path from "path";
import { execSync } from "child_process";
import { TransactionBlock, UpgradePolicy } from "@mysten/sui.js/transactions";
import {
  readJSONFile,
  signAndExecuteTxBlock,
  writeJSONFile,
} from "../utils";
import { ADMIN, ENV, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";

async function main() {
  const pkgPath = path.join(path.resolve(__dirname), "../");

  const { modules, dependencies, digest } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );

  const tx = new TransactionBlock();
  const cap = tx.object(TARGET_DEPLOYMENT.UpgradeCap);

  const ticket = tx.moveCall({
    target: "0x2::package::authorize_upgrade",
    arguments: [cap, tx.pure(UpgradePolicy.COMPATIBLE), tx.pure(digest)],
  });

  const receipt = tx.upgrade({
    modules,
    dependencies,
    packageId: TARGET_DEPLOYMENT.Package,
    ticket,
  });

  tx.moveCall({
    target: "0x2::package::commit_upgrade",
    arguments: [cap, receipt],
  });

  const result = await signAndExecuteTxBlock(tx, ADMIN, SUI_CLIENT, {
    showEffects: true,
    showObjectChanges: true,
  });

  const pkgAddress = (result.effects?.created as any)[0].reference.objectId;

  console.log(`Published upgraded package at address: ${pkgAddress}`);

  const filePath = "./deployment.json";
  const deployment = readJSONFile(filePath);
  deployment[ENV.DEPLOY_ON]["Package"] = pkgAddress;

  writeJSONFile(filePath, deployment);
}

main();
