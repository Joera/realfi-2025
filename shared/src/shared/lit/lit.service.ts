import { encryptAction } from "./actions/encrypt.js";

type LitEnvironment = 'dev' | 'prod';

interface LitServiceConfig {
  environment: LitEnvironment;
  accountKey?: string;
}

export class LitService {
  private baseUrl: string;
  private accountKey?: string;
  private poolKeys = new Map<string, string>(); // poolId → usageKey

  constructor(config: LitServiceConfig) {
    this.baseUrl = config.environment === 'dev'
      ? 'https://api.dev.litprotocol.com/core/v1'
      : 'https://api.chipotle.litprotocol.com/core/v1';
    this.accountKey = config.accountKey;
  }

  // ============================================================
  // Private
  // ============================================================

  private async call<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      body?: Record<string, unknown>;
      key?: string | null;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, key } = options;
    const apiKey = key === null ? undefined : (key ?? this.accountKey);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    console.log(`[Lit API] ${method} ${this.baseUrl}${endpoint}`, body ? JSON.stringify(body).slice(0, 200) : '');


    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    
    // Try to parse as JSON, handle HTML error pages
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Lit API returned non-JSON: ${response.status} ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(data.error ?? data.message ?? `HTTP ${response.status}`);
    }

    return data;
  }

  // ============================================================
  // Public (no auth)
  // ============================================================

  async getChainConfig() {
    return this.call<{
      chain_name: string;
      chain_id: number;
      contract_address: string;
    }>('/get_node_chain_config', { key: null });
  }

  async getActionCid(code: string): Promise<string> {

   

    const url = `${this.baseUrl}/get_lit_action_ipfs_id`;

    console.log(`[Lit API] ${url}`, code ? JSON.stringify(code).slice(0, 500) : '');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(code),  // just stringify the string itself
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Lit API returned non-JSON: ${response.status} ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(data.error ?? data.message ?? `HTTP ${response.status}`);
    }

    return data.ipfs_id;
  }

  // ============================================================
  // Management (account key)
  // ============================================================

  async createPkp() {
    const { wallet_address } = await this.call<{ wallet_address: string }>('/create_wallet');
    return wallet_address;
  }

  async createGroup(name: string, description?: string) {
    const result = await this.call<{ group_id: number | string; success: boolean }>('/add_group', {
      method: 'POST',
      body: {
        group_name: name,
        group_description: description ?? '',
        pkp_ids_permitted: [],
        cid_hashes_permitted: [],
      },
    });
    
    return {
      ...result,
      group_id: Number(result.group_id),  // ensure it's a number
    };
  }

  async addActionToGroup(groupId: number, actionCid: string) {
    return this.call<{ success: boolean }>('/add_action_to_group', {
      method: 'POST',
      body: { group_id: groupId, action_ipfs_cid: actionCid },
    });
  }

  async addPkpToGroup(groupId: number, pkpId: string) {
    return this.call<{ success: boolean }>('/add_pkp_to_group', {
      method: 'POST',
      body: { group_id: groupId, pkp_id: pkpId },
    });
  }

  async createUsageKey(params: { executeInGroups: number[] }) {
    return this.call<{ usage_api_key: string }>('/add_usage_api_key', {
      method: 'POST',
      body: {
        execute_in_groups: params.executeInGroups,
        can_create_pkps: false,
        can_create_groups: false,
        can_delete_groups: false,
        manage_ipfs_ids_in_groups: [],
        add_pkp_to_groups: [],
        remove_pkp_from_groups: [],
      },
    });
  }

  async removeUsageKey(usageKey: string) {
    return this.call<{ success: boolean }>('/remove_usage_api_key', {
      method: 'POST',
      body: { usage_api_key: usageKey },
    });
  }

  // ============================================================
  // Pool keys (in-memory)
  // ============================================================

  async initPoolKey(poolId: string, groupId: number): Promise<string> {
    const { usage_api_key } = await this.createUsageKey({
      executeInGroups: [groupId],
    });
    this.poolKeys.set(poolId, usage_api_key);
    return usage_api_key;
  }

  getPoolKey(poolId: string): string | undefined {
    return this.poolKeys.get(poolId);
  }

  async rotatePoolKey(poolId: string, groupId: number): Promise<string> {
    const oldKey = this.poolKeys.get(poolId);
    const newKey = await this.initPoolKey(poolId, groupId);
    if (oldKey) {
      await this.removeUsageKey(oldKey);
    }
    return newKey;
  }

  // ============================================================
  // Execution (pool key)
  // ============================================================

  async executeAction(
    poolId: string,
    code: string,
    jsParams: Record<string, unknown> = {}
  ) {
    const key = this.poolKeys.get(poolId);
    if (!key) throw new Error(`No key for pool ${poolId}`);

    return this.call<{ response: unknown; logs: string[]; has_error: boolean }>(
      '/lit_action',
      {
        method: 'POST',
        body: { code, js_params: jsParams },
        key,
      }
    );
  }

  // ============================================================
  // Encrypt / Decrypt
  // ============================================================

  async encrypt(poolId: string, pkpId: string, message: string): Promise<string> {
    const key = this.poolKeys.get(poolId);
    if (!key) throw new Error(`No key for pool ${poolId}`);

    const result = await this.call<{ response: { ciphertext: string } }>(
      '/lit_action',
      {
        method: 'POST',
        body: {
          code: encryptAction,
          js_params: { pkpId, message },
        },
        key,
      }
    );

    return result.response.ciphertext;
  }

  async decrypt(
    ciphertext: string,
    pkpId: string,
    userAddress: string,
    action: string,
    apiKey: string
  ): Promise<string> {
    const result = await this.call<{ response: { plaintext?: string; error?: string } }>(
      '/lit_action',
      {
        method: 'POST',
        body: {
          code: action,
          js_params: { pkpId, ciphertext, userAddress },
        },
        key: apiKey,
      }
    );

    if (result.response.error) {
      throw new Error(result.response.error);
    }

    return result.response.plaintext!;
  }
}