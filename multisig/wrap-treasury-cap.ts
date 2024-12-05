import { ENV, MULTI_SIG_WALLET, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";
import {
  createMsTxBytes,
  getCreatedObjectsIDs,
  readJSONFile,
} from "../utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";

async function main() {
  const txb = new TransactionBlock();

  txb.moveCall({
    arguments: [
      txb.object(TARGET_DEPLOYMENT.TreasuryCap),
    ],
    target: `${TARGET_DEPLOYMENT.Package}::blue::wrap_treasury_cap`,
  });

  const txBytes = await createMsTxBytes(SUI_CLIENT, txb, MULTI_SIG_WALLET.multisigAddress);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log(JSON.stringify(receipt));

  console.log({ txBytes });


  const holder = getCreatedObjectsIDs(receipt as any);

  const filePath = "./deployment.json";
  const deployment = readJSONFile(filePath);
  deployment[ENV.DEPLOY_ON]["TreasuryCapHolder"] = holder["TreasuryCapHolder"];

}

main();
