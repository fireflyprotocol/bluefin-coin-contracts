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
The directory contains scripts for multisig wallets. The table below details the different multi-sig scripts available and who can run those:
| Script        | Purpose           | Executor                                                   |
|:-------------|-------------------|------------------------------------------------------------|
| **ms:mint:tokens**          | Creates mint blue token transaction | Anyone, but must provide address of Treasury cap holding account |
| **ms:transfer:admin**          | Creates admin transfer transaction | Anyone, but must provide address of current admin account |
| **ms:transfer:treasury**          | Creates treasury transfer transaction | Anyone, but must provide address of current treasury account |
| **ms:transfer:tokens**  | Creates transaction to transfer BLUE tokens from multisig wallet to provided address | Any one with multisig and recipient wallet addresses and amounts.
| **ms:sign:tx**          | Signs multi-sig transaction | A multi-sig key holder account |
| **ms:exec:tx**          | Executes multi-sig transaction | Any one having multisig transaction and signatures |

