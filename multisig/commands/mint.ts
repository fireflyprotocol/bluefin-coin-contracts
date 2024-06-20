import {
  BLUE_TOKEN_DECIMALS,
  SUI_CLIENT,
  toBigNumberStr,
} from "../../scripts/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { TARGET_DEPLOYMENT, createMsTxBytes } from "../utils";

const AMOUNT = 1; // normal number with no extra base decimals
const RECEIVER =
  "0x2183df5aaf6366e5445c95fa238fc223dbbda54b7c363680578b435f657f1a29";

async function main() {
  const txb = new TransactionBlock();

  txb.moveCall({
    arguments: [
      txb.object(TARGET_DEPLOYMENT.TreasuryCap),
      txb.pure(toBigNumberStr(AMOUNT, BLUE_TOKEN_DECIMALS)),
      txb.pure(RECEIVER),
    ],
    target: `${TARGET_DEPLOYMENT.Package}::blue::mint`,
  });

  const txBytes = await createMsTxBytes(txb);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
