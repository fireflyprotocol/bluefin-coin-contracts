import { MULTI_SIG_WALLET, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";
import {
  createMsTxBytes,
} from "../utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";

/// Get this from https://suiscan.xyz/mainnet/account/0x...
const TOKEN_ID = "0x....";

async function main() {
  const txb = new TransactionBlock();

  txb.moveCall({
    arguments: [
      txb.object(TARGET_DEPLOYMENT.TreasuryCapHolder),
      txb.object(TOKEN_ID)
    ],
    target: `${TARGET_DEPLOYMENT.Package}::blue::burn_tokens`,
  });

  const txBytes = await createMsTxBytes(SUI_CLIENT, txb, MULTI_SIG_WALLET.multisigAddress);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
