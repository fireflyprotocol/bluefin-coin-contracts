import { getKeyPairFromSeed, getPublicKey } from "./utils";

const pk = getPublicKey(
  getKeyPairFromSeed(
    "enact ostrich winter upset quiz thank obscure cup cruel adapt lucky together"
  )
);

console.log(pk);
