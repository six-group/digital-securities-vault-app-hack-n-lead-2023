const LOCAL = process.env.NEXT_PUBLIC_LOCAL === "true";

const IS_BROWSER = (typeof window === 'undefined') ? false : true;

/**
 * This function lets us validate that the env variables we need are defined
 * and so we can fail early and let the developer fix their environment at
 * startup time.
 */
function checkStr(str: string | undefined, varName: string): string {
  if (!str) {
    if (IS_BROWSER && !varName.startsWith('NEXT_PUBLIC_')) {
      // These variables are never available in the browser, so we can't
      // check them.
      return str as string;
    }
    throw new Error(`Env variable "${varName}" not defined or empty`);
  }
  return str;
}

const RPC_URL = LOCAL
  ? "http://localhost:8545"
  : `https://eth-sepolia.g.alchemy.com/v2/${checkStr(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, 'NEXT_PUBLIC_ALCHEMY_API_KEY')}`;

console.log("RPC= ", RPC_URL)

const CHAIN_ID = LOCAL
  ? parseInt(checkStr(process.env.NEXT_PUBLIC_LOCAL_CHAIN_ID, 'NEXT_PUBLIC_LOCAL_CHAIN_ID'))
  : parseInt(checkStr(process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID, 'NEXT_PUBLIC_SEPOLIA_CHAIN_ID'));

const DSV_CONTRACT = LOCAL
  ? checkStr(process.env.NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS, 'NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS')
  : checkStr(process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS, 'NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS');

const ADMIN_ADDRESS = LOCAL
  ? checkStr(process.env.LOCAL_ADMIN_ADDRESS, 'LOCAL_ADMIN_ADDRESS')
  : checkStr(process.env.SEPOLIA_ADMIN_ADDRESS, 'SEPOLIA_ADMIN_ADDRESS');

export const CONFIG_SERVER = {
  RPC_URL,
  ADMIN_ADDRESS,
};

export const CONFIG_FRONT = {
  CHAIN_ID,
  DSV_CONTRACT,
};

console.log(`CONFIG_SERVER: ${JSON.stringify(CONFIG_SERVER, null, 2)}`);
console.log(`CONFIG_FRONT: ${JSON.stringify(CONFIG_FRONT, null, 2)}`);
