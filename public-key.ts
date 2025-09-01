import { mnemonicToEntropy } from "bip39";
import { C, fromHex, toHex, type Network } from "lucid-txpipe";

export function getPrivateKey(
  seed: string,
  options: {
    password?: string;
    addressType?: "Base" | "Enterprise";
    accountIndex?: number;
    network?: Network;
  } = { addressType: "Base", accountIndex: 0, network: "Mainnet" }
): C.PrivateKey {
  function harden(num: number): number {
    if (typeof num !== "number") throw new Error("Type number required here!");
    return 0x80000000 + num;
  }

  const entropy = mnemonicToEntropy(seed);
  const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
    fromHex(entropy),
    options.password
      ? new TextEncoder().encode(options.password)
      : new Uint8Array()
  );

  const accountKey = rootKey
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(options.accountIndex!));

  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  return paymentKey;
}

export function getPublicKey(seed: string) {
  const privateKey = getPrivateKey(seed);
  return toHex(privateKey.to_public().as_bytes());
}
// console.log(
//   getPublicKey(
//     // place a seed phrase here
//     ""
//   )
// );
