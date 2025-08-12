import { mnemonicToEntropy } from "bip39";
import { C, Data, fromHex, fromText, toHex, type Network } from "lucid-txpipe";
import readline from "readline";

export const SigSchema = Data.Tuple([Data.Bytes(), Data.Bytes()]);
export type SigSchemaT = Data.Static<typeof SigSchema>;

export const TokenInfo = Data.Array(
  Data.Object({
    asset: Data.Object({
      policy_id: Data.Bytes(),
      asset_name: Data.Bytes(),
    }),
    info: Data.Object({
      num: Data.Integer({ minimum: 0 }),
      den: Data.Integer({ minimum: 1 }),
    }),
  }),
);

export type TokenInfo = {
  asset: {
    policy_id: string;
    asset_name: string;
  };
  info: {
    num: bigint;
    den: bigint;
  };
}[];

export function getPrivateKey(
  seed: string,
  options: {
    password?: string;
    addressType?: "Base" | "Enterprise";
    accountIndex?: number;
    network?: Network;
  } = { addressType: "Base", accountIndex: 0, network: "Mainnet" },
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
      : new Uint8Array(),
  );

  const accountKey = rootKey
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(options.accountIndex!));

  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  return paymentKey;
}

export function roundToNearestSecond(offset: bigint) {
  const currentTimeWithOffset = BigInt(Date.now()) + offset;
  // Round to the nearest second
  return currentTimeWithOffset - (currentTimeWithOffset % 1000n);
}

export const bigintToByte = (n: bigint) =>
  Data.to<bigint>(n, Data.Integer as unknown as bigint);

const userFeesMsg = (validTo: bigint) => {
  const fees =
    "Copy fees from the 'Copy fees as object' button in the update fees modal";
  // {
  //   entryFee: 300n,
  //   exitFee: 300n,
  // };

  if (typeof fees === "string") {
    throw new Error("Fees are not set. Please read the README.md file");
  }

  let msg = "";
  msg = Data.to<SigSchemaT>(
    [
      Data.to<[bigint, bigint]>(
        [fees.entryFee, fees.exitFee],
        Data.Tuple([Data.Integer(), Data.Integer()]) as unknown as [
          bigint,
          bigint,
        ],
      ),
      bigintToByte(validTo),
    ],
    SigSchema as unknown as SigSchemaT,
  );

  return msg;
};

const weightsMsg = (validTo: bigint) => {
  const weightsUpdate =
    "Copy weights from the 'Copy weights as object' button in the update weights modal";
  // [
  //   {
  //     asset: {
  //       asset_name: '0014df1053554e444145',
  //       policy_id: 'a9fc2c980e6beed499b91089ca06ad433961a6238690219b8021fe43',
  //     },
  //     info: { num: 30n, den: 100n },
  //   },
  //   {
  //     asset: {
  //       asset_name: '0014df106f7263666178746f6b656e',
  //       policy_id: 'a9fc2c980e6beed499b91089ca06ad433961a6238690219b8021fe43',
  //     },
  //     info: { num: 70n, den: 100n },
  //   },
  // ];

  if (typeof weightsUpdate === "string") {
    throw new Error("Weights are not set. Please read the README.md file");
  }

  let msg = "";
  msg = Data.to<SigSchemaT>(
    [
      Data.to<TokenInfo>(weightsUpdate, TokenInfo as unknown as TokenInfo),
      bigintToByte(validTo),
    ],
    SigSchema as unknown as SigSchemaT,
  );

  return msg;
};

const collectFeesMsg = (validTo: bigint) => {
  const msg = Data.to<SigSchemaT>(
    ["47" + fromText("Collect"), bigintToByte(validTo)],
    SigSchema as unknown as SigSchemaT,
  );

  return msg;
};

async function askUserForMessage(validTo: bigint) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let msg: string | undefined;

  while (!msg) {
    await new Promise<void>((resolve) => {
      rl.question(
        "Which message do you want to sign? (weight/user/collect) ",
        (answer) => {
          switch (answer.trim().toLowerCase()) {
            case "weight":
              msg = weightsMsg(validTo);
              break;
            case "user":
              msg = userFeesMsg(validTo);
              break;
            case "collect":
              msg = collectFeesMsg(validTo);
              break;
            default:
              console.error("Please enter 'weight', 'user' or 'collect'");
              break;
          }
          resolve();
        },
      );
    });
  }

  rl.close();
  return msg;
}

async function signUserFees() {
  const seed: string = "";
  if (seed === "")
    return console.error(
      "Seed phrase is empty. Please read the README.md file",
    );

  try {
    const privateKey = getPrivateKey(seed);
    const publicKey = toHex(privateKey.to_public().as_bytes());
    console.log(`Your public key: ${publicKey}`);

    const validTo = roundToNearestSecond(BigInt(1000 * 60 * 60));
    const msg = await askUserForMessage(validTo);

    const signature = toHex(
      privateKey.sign(Buffer.from(msg, "hex")).to_bytes(),
    );

    console.log(`\nYour signature: ${signature}`);
    console.log(`Valid to value: ${validTo}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

signUserFees();
