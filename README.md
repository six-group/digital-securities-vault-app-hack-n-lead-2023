# Digital Securities Vault App

This is a Web3 app, designed to connect to the Digital Securities Vault smart contract.

You need to install and configure the
[Digital Securities Vault](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023)
smart contract app first.

Make sure you read the documentation there first for any of what we have here
to make sense. The rest of this page assumes you have done that.

## Stack

This a [NextJS](https://nextjs.org/) app, with [Prisma](https://www.prisma.io/)
for DB management. The latter is connected to an sqlite file-based DB for simplicity.

## DB Schema

It can be found under `prisma/schema.prisma`. It contains objects for Deposit
and Withdrawal, Member (for basic user management) and Balance (for maintaining
basic accounting).

### Intent status

The status for Deposits and Withdrawals is essentially calculated, based on if
the corresponding transactions fields are defined. Details on how this is
defined can be found in `helpers/status.ts`.

## Auth

The app only works for users that are connected to it through
[Metamask](https://metamask.io/). Each Member entry in the DB has an associated
`onchainAddress` which is compared against the connected Metamask address. This
mechanism takes care of Authentication. 

On the other hand, Authorization is a mix of on-chain and off-chain mechanisms:

* On-chain. The smart contract essentially understands 3 roles by using
  [OpenZeppelin's AccessControl](https://docs.openzeppelin.com/contracts/3.x/access-control):
  * Admin. This is given to the deployer of the smart contract. It is allowed
    to add and revoke operators. This role is designed for the **Admin** user that
    was set up as part of the setup of the [contracts app](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023).
  * Operator. This is the role that is allowed to confirm withdrawals and
    also cancel pending intents. It is designed for the **Operator** user that
    was set up as part of the setup of the [contracts app](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023).
  * No role. This is the case for any other user of the app.
* Off-chain. Additionally, the app distinguishes 2 types of off-chain roles.
  * Members. Examples from the
    [contracts app instructions](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023)
    would be **Member 1** and **Member 2**
  * External users. Examples from the
    [contracts app instructions](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023)
    would be **Depositor**

All users, except for the External ones have an entry in the DB.

The app is designed to do basic user management. This is doable under the
`Admin` and is only available to the address who has the Admin role on-chain.

### Notes on Auth

 The app cannot work without an Admin member as no one else will be able to add more
 members and no workflow will be able to be started. For this reason, when the app
 starts it calls the api endpoint `/init`. This will create the Admin member (with
 a predefined address from `.env`) if it does not already exist.

## Workflow

The app can submit and confirm deposit and withdrawal intents. In addition, it
maintains a ledger and allows for internal tranfers.

### Operations

 The main operations take place under the `Operations` tab. The view varies depending
 on the role of the currently connected user. Operator member can view all deposits
 and withdrawals. By convention, the Admin user is also an Operator from the App's
 perspective (to minimize role management on the app level).

### Balances

 Under the `Balances` tab, users can view their balances. The transfer form opens
 with a toggle and then users can transfer funds to other users. The balance, per coin,
 has a locked part and a total part. A user can only transfer or submit a withdrawal
 intent for the unlocked part. Once a withdrawal intent has been submitted that
 amount is deemed locked (until it is confirmed or cancelled).

## Other notes

* This app can be run either on Sepolia or the localhost (against a local Hardhat network
  for example). This is what the `NEXT_PUBLIC_LOCAL` env var is for.
* In the `.env` file the address where the actual contract has been deployed on
  Sepolia can be found.
* The app needs the ABIs (Application Binary Interfaces) of the contracts it uses
  (including the test tokens). These are in the `helpers` folder. If the contract
  is changed then the corresponding ABI must also be updated here.

## Project

Make sure you followed the instructions from
[Digital Securities Vault](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023)
first.

### Env variables

Before we start we need to configure some env variables so that the app knows
about the things we got from the
[Digital Securities Vault](https://github.com/six-group/digital-securities-vault-contracts-hack-n-lead-2023).

For that, create a file named `.env.local` at the root of the project and paste
there the content of the `.env`.

Follow the instructions in the file itself to fill in the variables.

### Build and run

Download and install all dependencies first:

```bash
yarn
```

#### Set up DB

Before running the app locally for the first time you need to initiate the database:

```bash
yarn prisma-init
```

You only need to this once unless you delete the generated `prisma/dev.db` file.

#### Run during development

```bash
yarn dev
```

The app will run in <http://localhost:3000/>.

#### Run in optimized mode

If you want to build and run the app as it would be for a production environment
you would need to build it like this:

```bash
yarn build
```

And the start the app:

```bash
yarn start
```

The app will run in <http://localhost:3000/>.
