import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MULTI_SIG_WALLET, SUI_CLIENT, TARGET_DEPLOYMENT } from "../env";
import { createMsTxBytes } from "../utils";

/// Get this from https://suiscan.xyz/mainnet/account/0x...
const TOKEN_ID = "0x....";

const RECIPIENTS = [
    {
        address: "0x2183df5aaf6366e5445c95fa238fc223dbbda54b7c363680578b435f657f1a29",
        amount: 1_000_000_000 // must be in 1e9 format
    }
]

async function main() {
  const txb = new TransactionBlock();

  for(const receiver of RECIPIENTS){
    const coin = txb.splitCoins(txb.object(TOKEN_ID), [txb.pure.u64(receiver.amount)]);
    txb.transferObjects([coin], receiver.address);
  }

  const txBytes = await createMsTxBytes(SUI_CLIENT, txb, MULTI_SIG_WALLET.multisigAddress);

  const receipt = await SUI_CLIENT.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });

  console.log({ txBytes });

  console.log(JSON.stringify(receipt));
}

main();
