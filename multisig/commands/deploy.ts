import path from "path";
import { ENV, SUI_CLIENT } from "../../scripts/utils";
import { execSync } from "child_process";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MS_WALLET, createMsTxBytes } from "../utils";

async function main() {
  console.log(`Network: ${ENV.DEPLOY_ON}`);
  console.log(`Deployer: ${MS_WALLET.multisigAddress}`);

  const pkgPath = path.join(path.resolve(__dirname), "../");
  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({ modules, dependencies });

  tx.transferObjects([upgradeCap], tx.pure(MS_WALLET.multisigAddress));

  const txBytes = await createMsTxBytes(tx);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
