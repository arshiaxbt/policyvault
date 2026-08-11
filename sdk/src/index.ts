import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Attribution } from 'ox/erc8021';

const POLICY_VAULT_ABI = [
  {
    type: 'function',
    name: 'spend',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_memo', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getVault',
    stateMutability: 'view',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'agent', type: 'address' },
      {
        name: 'policy',
        type: 'tuple',
        components: [
          { name: 'dailyLimit', type: 'uint256' },
          { name: 'perTxLimit', type: 'uint256' },
          { name: 'approvalThreshold', type: 'uint256' },
          { name: 'paused', type: 'bool' },
        ],
      },
      { name: 'balance', type: 'uint256' },
      { name: 'spentToday', type: 'uint256' },
      { name: 'dayStart', type: 'uint256' },
    ],
  },
] as const;

/** Builder Code from base.dev */
export const BUILDER_CODE = 'bc_aby8yf1k';

/** ERC-8021 suffix for Builder Code bc_aby8yf1k */
export const DEFAULT_BUILDER_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
}) as Hex;

/** PolicyVault on Base mainnet */
export const POLICY_VAULT_ADDRESS =
  '0xA99bfE8D56A42C4060568C681804D08432Ab2bD5' as Address;

export interface PolicyVaultConfig {
  /** PolicyVault contract address on Base */
  contractAddress?: Address;
  /** Vault ID to spend from */
  vaultId: bigint;
  /** Agent's private key (hex) */
  agentPrivateKey: Hex;
  /** Optional RPC URL (defaults to Base public) */
  rpcUrl?: string;
  /**
   * Optional ERC-8021 Builder Code data suffix.
   * Defaults to bc_aby8yf1k. Prefer client-level dataSuffix (already set).
   */
  builderCodeSuffix?: Hex;
}

/**
 * Create a PolicyVault agent client.
 * Spends USDC under policy; every tx is attributed with Builder Code.
 *
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export function createPolicyAgent(config: PolicyVaultConfig) {
  const {
    contractAddress = POLICY_VAULT_ADDRESS,
    vaultId,
    agentPrivateKey,
    rpcUrl,
    builderCodeSuffix = DEFAULT_BUILDER_SUFFIX,
  } = config;

  const account = privateKeyToAccount(agentPrivateKey);
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({
    chain: base,
    transport,
    account,
    // Client-level attribution per Base docs
    dataSuffix: builderCodeSuffix,
  });

  return {
    account: account.address,

    /**
     * Spend USDC from vault. Amount in USDC (e.g. 0.05 = $0.05).
     * Memo is stored onchain in the Spent event for receipts.
     */
    async spend(to: Address, amountUsdc: number, memo: string = '') {
      const amount = BigInt(Math.round(amountUsdc * 1e6));
      const memoHex = (`0x${Buffer.from(memo, 'utf8').toString('hex')}` ||
        '0x') as Hex;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: POLICY_VAULT_ABI,
        functionName: 'spend',
        args: [vaultId, to, amount, memoHex],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },

    /** Check remaining balance and daily spend */
    async status() {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: POLICY_VAULT_ABI,
        functionName: 'getVault',
        args: [vaultId],
      });
      const [owner, agent, policy, balance, spentToday] = result;
      return {
        owner,
        agent,
        dailyLimit: Number(policy.dailyLimit) / 1e6,
        perTxLimit: Number(policy.perTxLimit) / 1e6,
        balance: Number(balance) / 1e6,
        spentToday: Number(spentToday) / 1e6,
        paused: policy.paused,
      };
    },
  };
}
