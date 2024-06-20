import { SUI_CLIENT } from "../../scripts/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { TARGET_DEPLOYMENT, createMsTxBytes } from "../utils";

const RECEIVER =
  "0x2183df5aaf6366e5445c95fa238fc223dbbda54b7c363680578b435f657f1a29";

async function main() {
  const txb = new TransactionBlock();

  txb.transferObjects([TARGET_DEPLOYMENT.TreasuryCap], RECEIVER);

  const txBytes = await createMsTxBytes(txb);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
