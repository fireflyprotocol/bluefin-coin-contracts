import { MULTI_SIG_WALLET, SUI_CLIENT } from "../env";
import { combineMSTx } from "../utils";

async function main() {
  const txBytes =
    "AAACAD8lTi/HGBbFYtlG3fXIOtCBSD0ToaOPwyhPpqk/XRVBFzhHxIAAAAAIAiYVrYhSk9ix2B/xZsJEx9uufR+SpFe9oRjL+NFRe4DACAhg99ar2Nm5URclfojj8Ij272lS3w2NoBXi0NfZX8aKQEBAQEAAAEBAAvy0ItWR+mLUi0uwh9dPDpvG16YEUSWmcUMzYjWG4Z7AXgD1Skg3aIPNhyhCnk3TQfPvovUxt5e69Sh3JXfWcW8XeEfEgAAAAAgDnnhqnS0XLq0vUsNeYSVjWUnAMzCdfwS5RdyazcfL1IL8tCLVkfpi1ItLsIfXTw6bxtemBFElpnFDM2I1huGe+4CAAAAAAAAlDYmAAAAAAAA";

  const signatures = [
    "AamhpafUi6JIe37a/sbaphk7A04WdUM2Hsvh5MnnOWKCQczmZ6fQSMT20fe1oCiK5PhvOVIxLul5+swvFGrrNMQDSQv7fZB1KB4AqYYUq/Fix2vIm+UcJdbKzTAFwkIP8gk=", // wallet 1
    "ActcHr+nve4CAGLIL7/Kd0aRQKvkdYnRCLbSfzyDgnWVceqKcD88ujISRR54JX0+3knT0+OvP139PaJo4oiou3wC1Ijjlm9EygtIbosTwpliFlckPAt9WM3FeOFBP6pIVKc=", // wallet 2
    "AZG4ONiIUAnbchwwU7Y+m7HrcZtPogL8+TJnftirRSvxFfCM0wS7XXV47/Zdp7V+ofksSS42pFwG5fqhFqCNdsUDFV4daCpG3JPm1BsrCcKrc8YKR8PUt9gwHSzDWPYn7N4=", // wallet 3
  ];
  
  const msSign = combineMSTx(signatures, MULTI_SIG_WALLET);
  console.log(msSign);

  const resp = await SUI_CLIENT.executeTransactionBlock({
    transactionBlock: txBytes,
    signature: msSign.multisigSerialized,
    options: {
      showEffects: true,
    },
  });

  console.log(JSON.stringify(resp));
}

main();
