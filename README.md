## Pre-requisites

Run `bun install`.

### How to sign the update fees order

When you want to update 'weights', 'user fees' or simply 'collect fees' from an MTK using "My wallet" page, you will need to enter a signature and a number. These values ​​can be obtained from the `sign-fees.ts` file.

#### Steps

1. Open the `sign-fees.ts` file, search `seed` constant and add the 'seed' with which you want to sign.
2. If you want to sign:
   - weights: go to `weightsMsg` and edit the list of tokens. You'll find the object with the tokens on the Metera `/me` page. Set the values ​​you want to update and click the "Copy weights as object" button. These tokens are in the same order as they are in the portfolio (see the database for more information). In the following example we update SUNDAE and FACT (as first and second token) with 30% and 70%

   ```ts
   const weightsUpdate = [
     {
       asset: {
         asset_name: "0014df1053554e444145",
         policy_id: "a9fc2c980e6beed499b91089ca06ad433961a6238690219b8021fe43",
       },
       info: { num: 30n, den: 100n },
     },
     {
       asset: {
         asset_name: "0014df106f7263666178746f6b656e",
         policy_id: "a9fc2c980e6beed499b91089ca06ad433961a6238690219b8021fe43",
       },
       info: { num: 70n, den: 100n },
     },
   ];
   ```

   - user fess: go to `userFeesMsg` and edit the `fees` object. You'll find the object with the fees on the Metera `/me` page. Set the values ​​you want to update and click the "Copy fees as object" button. **NOTE**: If you want to update the exit fee to 2%, you the object will be `200n`, this is 2\*100, for a value of 0.5% it will be `50n`. In the following example, entry and exit fees are being set to 3% each:

   ```ts
   const fees = {
     entryFee: 300n,
     exitFee: 300n,
   };
   ```

   - collect: **Should never be edited**

3. Finally, `bun run sign-fees.ts` and select the action to perform.

### How to get the public key

1. Open `public-key.ts` and paste your seed phrase here:

```ts
console.log(
  getPublicKey(
    // place a seed phrase here
    "",
  ),
);
```

2. Run `bun run public-key.ts`.
