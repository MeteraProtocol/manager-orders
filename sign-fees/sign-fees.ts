import "dotenv/config";
import { toHex } from "lucid-txpipe";
import readline from "readline";
import { getPrivateKey } from "../public-key";
import { roundToNearestSecond } from "../utils";
import { collect } from "./collect";
import { updateUserFees } from "./update-user-fees";
import { updateWeights } from "./update-weights";

const ACTION_MESSAGE = `
Select the action you want to perform:
1. (weight) Update weights 
2. (user) Update user fees
3. (collect) Collect fees

Write the number or the word of the action in parentheses: `;

async function askUserForMessage(validTo: bigint) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let msg: string | undefined;

  while (!msg) {
    await new Promise<void>((resolve) => {
      rl.question(ACTION_MESSAGE, (answer) => {
        switch (answer.trim().toLowerCase()) {
          case "weight":
          case "1":
            msg = updateWeights(validTo);
            break;
          case "user":
          case "2":
            msg = updateUserFees(validTo);
            break;
          case "collect":
          case "3":
            msg = collect(validTo);
            break;
          default:
            console.error("\nInvalid action.");
            console.error(
              "Please enter 'weight' or '1', 'user' or '2', or 'collect' or '3'\n"
            );
            break;
        }
        resolve();
      });
    });
  }

  rl.close();
  return msg;
}

async function signUserFees() {
  console.clear();
  console.log("-- METERA INTERFACE FOR INTERACT WITH MTKS AS ADMIN --\n");

  try {
    const seed = process.env.SEED;
    if (!seed)
      throw new Error(
        "Seed is required. Please set the SEED environment variable."
      );

    const privateKey = getPrivateKey(seed);
    const publicKey = toHex(privateKey.to_public().as_bytes());
    console.log(`Your public key: ${publicKey}\n`);

    const validTo = roundToNearestSecond(BigInt(1000 * 60 * 60));
    const msg = await askUserForMessage(validTo);

    const signature = toHex(
      privateKey.sign(Buffer.from(msg, "hex")).to_bytes()
    );

    console.log("\nPaste the following info in the page:");
    console.log(`* Signed CBOR: ${signature}`);
    console.log(`* Valid until: ${validTo}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

signUserFees();
