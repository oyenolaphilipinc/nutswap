import {
  Address,
  Cell,
  Contract,
  ContractProvider,
  SendMode,
  Sender,
  beginCell,
  contractAddress,
} from "@ton/core";
import { Op } from "./constants";

type SwapRootConfig = {
  adminAddress: Address;
  coAdminAddress: Address;
  fee: bigint;
  gasFee: bigint;
  fwdAmount: bigint;
  minValue: bigint;
  totalReferralRewards: bigint;
  devFeePercent: number;
  referralFeePercent: number;
  swapAggregatorCode: Cell;
};
// slice admin_address = ds~load_msg_addr();
// slice co_admin_address = ds~load_msg_addr();
// int fee = ds~load_coins();
// cell swap_wallet_code = ds~load_ref();

function swapRootConfigToCell(config: SwapRootConfig) {
  return beginCell()
    .storeAddress(config.adminAddress)
    .storeAddress(config.coAdminAddress)
    .storeCoins(config.fee)
    .storeCoins(config.gasFee)
    .storeCoins(config.fwdAmount)
    .storeCoins(config.minValue)
    .storeCoins(config.totalReferralRewards)
    .storeUint(config.devFeePercent, 32)
    .storeUint(config.referralFeePercent, 32)
    .storeRef(config.swapAggregatorCode)
    .endCell();
}

export class SwapRoot implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new SwapRoot(address);
  }

  static createFromConfig(config: SwapRootConfig, code: Cell, workchain = 0) {
    const data = swapRootConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new SwapRoot(address, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendInitializeAggregator(
    provider: ContractProvider,
    via: Sender,
    value: bigint
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(Op.initialize_swap_wallet, 32).endCell(),
    });
  }

  async sendUpdateFees(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    options: {
      fee: bigint;
      gasFee: bigint;
      fwdAmount: bigint;
      minValue: bigint;
      devFeePercent: number;
      referralFeePercent: number;
    }
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.update_fees, 32)
        .storeCoins(options.fee)
        .storeCoins(options.gasFee)
        .storeCoins(options.fwdAmount)
        .storeCoins(options.minValue)
        .storeUint(options.devFeePercent, 32)
        .storeUint(options.referralFeePercent, 32)
        .endCell(),
    });
  }

  async sendChangeAdmin(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    newAdmin: Address
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.change_admin, 32)
        .storeAddress(newAdmin)
        .endCell(),
    });
  }

  async sendCoChangeAdmin(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    newCoAdmin: Address
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.change_co_admin, 32)
        .storeAddress(newCoAdmin)
        .endCell(),
    });
  }

  async sendWithdrawExcessTon(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    amount: bigint,
    address: Address
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Op.withdraw_ton, 32)
        .storeCoins(amount)
        .storeAddress(address)
        .endCell(),
    });
  }

  async getUserAggregatorAddress(
    provider: ContractProvider,
    ownerAddress: Address
  ): Promise<Address> {
    const resp = await provider.get("get_user_swap_aggregator_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);

    return resp.stack.readAddress();
  }

  async getSwapRootData(provider: ContractProvider) {
    const resp = await provider.get("get_root_data", []);
    return {
      adminAddress: resp.stack.readAddress(),
      coAdminAddress: resp.stack.readAddress(),
      fixedFee: resp.stack.readNumber(),
      gasFee: resp.stack.readNumber(),
      fwdAmount: resp.stack.readNumber(),
      minValue: resp.stack.readNumber(),
      totalReferralRewards: resp.stack.readNumber(),
      devFeePercent: resp.stack.readNumber(),
      referralPercent: resp.stack.readNumber(),
      swapAggregatorCode: resp.stack.readCell(),
    };
  }
}
