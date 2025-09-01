import fs from "fs";
import JSONBig from "json-bigint";
import { Data } from "lucid-txpipe";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { bigintToByte, SigSchema, type SigSchemaT, TokenInfo } from "../utils";

const JSONbig = JSONBig({
  alwaysParseAsBig: true,
  useNativeBigInt: true,
  strict: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const weightsSchema = z.array(
  z.object({
    asset: z.object({
      asset_name: z.string(),
      policy_id: z.string(),
    }),
    info: z.object({
      num: z.bigint(),
      den: z.bigint(),
    }),
  })
);

export function updateWeights(validTo: bigint) {
  const weights = fs.readFileSync(__dirname + "/input.txt", "utf8");
  const bigIntRegex = /(\d+)n/g;
  const objWeights = JSONbig.parse(
    weights.replace(bigIntRegex, (match) => {
      return match.replace("n", "");
    })
  );
  const parsedWeights = weightsSchema.parse(objWeights);

  let msg = "";
  msg = Data.to<SigSchemaT>(
    [
      Data.to<TokenInfo>(parsedWeights, TokenInfo as unknown as TokenInfo),
      bigintToByte(validTo),
    ],
    SigSchema as unknown as SigSchemaT
  );

  return msg;
}
