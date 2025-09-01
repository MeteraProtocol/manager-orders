import { Data, fromText } from "lucid-txpipe";
import { bigintToByte, SigSchema, type SigSchemaT } from "../utils";

export function collect(validTo: bigint) {
  const msg = Data.to<SigSchemaT>(
    ["47" + fromText("Collect"), bigintToByte(validTo)],
    SigSchema as unknown as SigSchemaT
  );

  return msg;
}
