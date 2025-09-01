import { Data } from "lucid-txpipe";

export const bigintToByte = (n: bigint) =>
  Data.to<bigint>(n, Data.Integer as unknown as bigint);

export function roundToNearestSecond(offset: bigint) {
  const currentTimeWithOffset = BigInt(Date.now()) + offset;
  return currentTimeWithOffset - (currentTimeWithOffset % 1000n);
}

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
  })
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
