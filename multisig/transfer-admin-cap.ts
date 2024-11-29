import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MULTI_SIG_WALLET, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";
import { createMsTxBytes } from "../utils";

const RECEIVER =
  "0x2183df5aaf6366e5445c95fa238fc223dbbda54b7c363680578b435f657f1a29";

async function main() {
  const txb = new TransactionBlock();

  txb.transferObjects([TARGET_DEPLOYMENT.UpgradeCap], RECEIVER);

  const txBytes = await createMsTxBytes(SUI_CLIENT, txb, MULTI_SIG_WALLET.multisigAddress);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
