import path from "path";
import { execSync } from "child_process";
import { TransactionBlock, UpgradePolicy } from "@mysten/sui.js/transactions";
import {
  createMsTxBytes,
  dryRunTxBlock,
} from "../utils";
import { ADMIN, MULTI_SIG_WALLET, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";

async function main() {
  const pkgPath = path.join(path.resolve(__dirname), "../");

  const { modules, dependencies, digest } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );

  const txb = new TransactionBlock();
  const cap = txb.object(TARGET_DEPLOYMENT.UpgradeCap);

  const ticket = txb.moveCall({
    target: "0x2::package::authorize_upgrade",
    arguments: [cap, txb.pure(UpgradePolicy.COMPATIBLE), txb.pure(digest)],
  });

  const receipt = txb.upgrade({
    modules,
    dependencies,
    packageId: TARGET_DEPLOYMENT.Package,
    ticket,
  });

  txb.moveCall({
    target: "0x2::package::commit_upgrade",
    arguments: [cap, receipt],
  });


  const txBytes = await createMsTxBytes(SUI_CLIENT, txb, MULTI_SIG_WALLET.multisigAddress);

  const txResponse = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  const pkgAddress = (txResponse.effects?.created as any)[0].reference.objectId;

  console.log(`Published upgraded package at address: ${pkgAddress}`);

}

main();
