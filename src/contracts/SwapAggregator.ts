import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "@ton/core";
import { Op } from "./constants";

export type SwapAggregatorConfig = {};

export function swapAggregatorConfigToCell(config: SwapAggregatorConfig): Cell {
  return beginCell().endCell();
}

export class SwapAggregator implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new SwapAggregator(address);
  }

  static createFromConfig(
    config: SwapAggregatorConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = swapAggregatorConfigToCell(config);
    const init = { code, data };
    return new SwapAggregator(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendSwapTonToJetton(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    options: {
      receipientAddress: Address;
      poolAddress: Address;
      tonVaultAddr: Address;
      limit: bigint;
      deadline: number;
      referralAddress: Cell;
    }
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.make_swap_ton, 32)
        .storeAddress(options.receipientAddress)
        .storeAddress(options.poolAddress)
        .storeAddress(options.tonVaultAddr)
        .storeCoins(options.limit)
        .storeUint(options.deadline, 32)
        .storeRef(options.referralAddress)
        .endCell(),
    });
  }

  async sendWithdrawExcessTon(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    amount: bigint
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.withdraw_ton, 32)
        .storeCoins(amount)
        .endCell(),
    });
  }

  async sendWithdrawJetton(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    options: { jettonAmount: bigint; userAggregatorJettonAddress: Address }
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.withdraw_jetton, 32)
        .storeCoins(options.jettonAmount)
        .storeAddress(options.userAggregatorJettonAddress)
        .endCell(),
    });
  }

  async getSwapAggregatorData(provider: ContractProvider) {
    const resp = await provider.get("get_swap_wallet_data", []);
    return {
      ownerAddress: resp.stack.readAddress(),
      noReferredUsers: resp.stack.readNumber(),
      earned: resp.stack.readNumber(),
      initialized: resp.stack.readNumber(),
      referrerData: resp.stack.readCell(),
      swapRootAddress: resp.stack.readAddress(),
      swapAggregatorCode: resp.stack.readCell(),
    };
  }
}
