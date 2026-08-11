import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
  encodeFunctionData,
  parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const POLICY_VAULT_ABI = parseAbi([
  'function spend(uint256 _id, address _to, uint256 _amount, bytes _memo) external',
  'function getVault(uint256 _id) view returns (address owner, address agent, tuple(uint256 dailyLimit, uint256 perTxLimit, uint256 approvalThreshold, bool paused) policy, uint256 balance, uint256 spentToday, uint256 dayStart)',
]);

/** Default ERC-8021 suffix for Builder Code bc_aby8yf1k */
export const DEFAULT_BUILDER_SUFFIX =
  '0x62635f616279387966316b0b0080218021802180218021802180218021' as Hex;

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
  /** Optional ERC-8021 Builder Code data suffix */
  builderCodeSuffix?: Hex;
}

/**
 * Create a PolicyVault agent client.
 * One-liner to spend USDC under policy from your agent.
 *
 * ```ts
 * const agent = createPolicyAgent({ vaultId: 0n, agentPrivateKey: '0x...' });
 * await agent.spend('0xmerchant...', 0.05, 'exa-search-query');
 * ```
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
  });

  return {
    account: account.address,

    /**
     * Spend USDC from vault. Amount in USDC (e.g. 0.05 = $0.05).
     * Memo is stored onchain in the Spent event for receipts.
     * Every spend is attributed with Builder Code bc_aby8yf1k.
     */
    async spend(to: Address, amountUsdc: number, memo: string = '') {
      const amount = BigInt(Math.round(amountUsdc * 1e6));
      const memoHex = (`0x${Buffer.from(memo, 'utf8').toString('hex')}` || '0x') as Hex;

      const data = encodeFunctionData({
        abi: POLICY_VAULT_ABI,
        functionName: 'spend',
        args: [vaultId, to, amount, memoHex],
      });

      // Append ERC-8021 Builder Code suffix
      const txData = (data + builderCodeSuffix.slice(2)) as Hex;

      const hash = await walletClient.sendTransaction({
        to: contractAddress,
        data: txData,
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
      const [owner, agent, policy, balance, spentToday] = result as any;
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
