import fs from "fs";
import JSONBig from "json-bigint";
import { Data } from "lucid-txpipe";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { bigintToByte, SigSchema, type SigSchemaT } from "../utils";

const JSONbig = JSONBig({
  alwaysParseAsBig: true,
  useNativeBigInt: true,
  strict: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const feesSchema = z.object({
  entryFee: z.bigint(),
  exitFee: z.bigint(),
});

export function updateUserFees(validTo: bigint) {
  const fees = fs.readFileSync(__dirname + "/input.txt", "utf8");
  const bigIntRegex = /(\d+)n/g;
  const objFees = JSONbig.parse(
    fees.replace(bigIntRegex, (match) => {
      return match.replace("n", "");
    })
  );
  const parsedFees = feesSchema.parse(objFees);

  let msg = "";
  msg = Data.to<SigSchemaT>(
    [
      Data.to<[bigint, bigint]>(
        [parsedFees.entryFee, parsedFees.exitFee],
        Data.Tuple([Data.Integer(), Data.Integer()]) as unknown as [
          bigint,
          bigint
        ]
      ),
      bigintToByte(validTo),
    ],
    SigSchema as unknown as SigSchemaT
  );

  return msg;
}
