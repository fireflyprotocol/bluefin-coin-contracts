<div align="center">
  <img height="100x" src="https://bluefin.io/images/bluefin-logo.svg" />

  <h1 style="margin-top:20px;">Bluefin Coin</h1>

</div>

Repo containing bluefin's coin contract for Sui blockchain. 

### How To?
- Install dependencies using `yarn`
- Build contracts using `yarn build`
- Update `.env` and to `yarn deploy` to deploy the contracts. The script will deploy the contracts and write package and other important object details to "deployment.json"

### Scripts
- Mint coins using `yarn mint`
- Burn coins using `yarn burn`
- Get coin info using `yarn coin-info`

### Multisig
The directory contains scripts to execute operations using multi sig wallet and also to create a multisig
- `create-wallet:` Allows user to create a multisig wallet. Just update the script with public keys of the accounts owning the multisig and update signing threshold before execution
- `execTx:` Executes a singed multisig transaction. Before executing the tx, we must create its tx bytes and sign them using the multisig owners
- `signTx:` Allows the owner of multisig to sign the tx bytes
- `commands:` Scripts/Commands that the multisig wallet can execute. The scripts generate the tx bytes of the commands that must be signed and executed.