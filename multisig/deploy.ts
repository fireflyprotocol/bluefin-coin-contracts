import path from "path";
import { execSync } from "child_process";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { ENV, MULTI_SIG_WALLET, SUI_CLIENT } from "../env";
import { createMsTxBytes } from "../utils";

async function main() {
  console.log(`Network: ${ENV.DEPLOY_ON}`);
  console.log(`Deployer: ${MULTI_SIG_WALLET.multisigAddress}`);

  const pkgPath = path.join(path.resolve(__dirname), "../");
  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${pkgPath}`, {
      encoding: "utf-8",
    })
  );
  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({ modules, dependencies });

  tx.transferObjects([upgradeCap], tx.pure(MULTI_SIG_WALLET.multisigAddress));

  const txBytes = await createMsTxBytes(SUI_CLIENT, tx, MULTI_SIG_WALLET.multisigAddress);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
