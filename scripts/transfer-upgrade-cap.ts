import { TransactionBlock } from "@mysten/sui.js/transactions";
import { ADMIN, TARGET_DEPLOYMENT, SUI_CLIENT } from "../env";
import { signAndExecuteTxBlock } from "../utils";

async function main(){

    const txb = new TransactionBlock();
    txb.transferObjects(
        [txb.object(TARGET_DEPLOYMENT.UpgradeCap)],
        txb.pure.address("0x0000000000000000000000000000000000000000000000000000000000000000")
    )

    await signAndExecuteTxBlock(txb, ADMIN, SUI_CLIENT);

}

main();