import {
  Address,
  Cell,
  OpenedContract,
  Sender,
  beginCell,
  fromNano,
  toNano,
} from "@ton/core";

import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  PoolType,
  ReadinessStatus,
  VaultJetton,
} from "@dedust/sdk";

import { TonClient4 } from "@ton/ton";
import { SwapAggregator } from "@/contracts/SwapAggregator";

export class Swap {
  static async tonToJetton(
    swapAggregator: OpenedContract<SwapAggregator>,
    sender: Sender,
    userAddress: Address | undefined,
    client: TonClient4,
    tokenAddress: string,
    amountIn: bigint,
    gas: bigint,
    slippage: number,
    deadline: number,
    referralAddr: string
  ) {
    if (!userAddress) return;
    if (!(amountIn > 0)) return;
    try {
      let referralAddress = beginCell().endCell();
      if (referralAddr) {
        referralAddress = beginCell()
          .storeAddress(Address.parse(referralAddr))
          .endCell();
      }

      const TON = Asset.native();
      const TOKEN = Asset.jetton(Address.parse(tokenAddress));

      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const tonVault = client.open(await factory.getNativeVault());

      const TON_TOKEN_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN])
      );

      // check if pool exists
      if (
        (await TON_TOKEN_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`Pool (TON, ${tokenAddress}) does not exist`);
      }

      //check if vault exists
      if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error("Vault (TON) does not exist");
      }

      const { amountOut: expectedAmountOut } =
        await TON_TOKEN_POOL.getEstimatedSwapOut({
          assetIn: TON,
          amountIn,
        });

      // Slippage handling (1%)
      const minAmountOut = toNano(
        (Number(fromNano(expectedAmountOut)) * 100 - slippage) / 100
      ); // expectedAmountOut - 1%
      console.log(fromNano(minAmountOut));

      return await swapAggregator.sendSwapTonToJetton(
        sender,
        amountIn + gas ? gas : toNano(0),
        {
          receipientAddress: userAddress,
          poolAddress: TON_TOKEN_POOL.address,
          tonVaultAddr: tonVault.address,
          limit: minAmountOut,
          deadline,
          referralAddress,
        }
      );
    } catch (err) {
      console.log("tonToJettonFunc", err.message);
    }
  }

  static async jettonToJetton(
    sender: Sender,
    userAddress: Address | undefined,
    userSwapAggregatorAddress: Address,
    client: TonClient4,
    tokenAddress1: string,
    tokenAddress2: string,
    amountIn: bigint,
    jettonPriceToTon: bigint,
    limit: bigint,
    deadline: number,
    referralAddr: string
  ) {
    if (!userAddress) return;
    let referralAddress = beginCell().endCell();
    if (referralAddr) {
      referralAddress = beginCell()
        .storeAddress(Address.parse(referralAddr))
        .endCell();
    }
    const TON = Asset.native();
    const TOKEN_1 = Asset.jetton(Address.parse(tokenAddress1));
    const TOKEN_2 = Asset.jetton(Address.parse(tokenAddress2));

    try {
      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const TOKEN_1_ROOT = client.open(
        JettonRoot.createFromAddress(Address.parse(tokenAddress1))
      );

      const TOKEN_1_WALLET = client.open(
        await TOKEN_1_ROOT.getWallet(userAddress)
      );

      const TON_TOKEN_1_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN_1])
      );

      const TON_TOKEN_2_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN_2])
      );

      const TOKEN_1_VAULT = client.open(
        await factory.getJettonVault(Address.parse(tokenAddress1))
      );

      // check if pool exists
      if (
        (await TON_TOKEN_1_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${TON_TOKEN_1_POOL.address}) does not exist`
        );
      }

      if (
        (await TON_TOKEN_2_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${TON_TOKEN_2_POOL.address}) does not exist`
        );
      }

      if (
        (await TOKEN_1_VAULT.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`${tokenAddress1} vault does not exist`);
      }

      return await TOKEN_1_WALLET.sendTransfer(
        sender,
        toNano("0.3") + toNano(Number(fromNano(jettonPriceToTon)) * 0.01),
        {
          queryId: 0,
          amount: amountIn,
          destination: userSwapAggregatorAddress,
          responseAddress: userAddress,
          customPayload: new Cell(),
          forwardAmount: toNano("0.25"),
          forwardPayload: beginCell()
            .storeRef(
              VaultJetton.createSwapPayload({
                poolAddress: TON_TOKEN_1_POOL.address,
                limit,
                swapParams: { recipientAddress: userAddress, deadline },
                next: { poolAddress: TON_TOKEN_2_POOL.address },
              })
            )
            .storeCoins(jettonPriceToTon) //jetton converted to ton
            .storeAddress(
              (
                await TOKEN_1_ROOT.getWallet(userSwapAggregatorAddress)
              ).address
            )
            .storeAddress(TOKEN_1_VAULT.address)
            .storeRef(referralAddress)
            .endCell(),
        }
      );
    } catch (err) {
      console.log("jettonToJetton", err);
    }
  }

  static async jettonToTon(
    sender: Sender,
    userAddress: Address | undefined,
    userSwapAggregatorAddress: Address,
    client: TonClient4,
    tokenAddress: string,
    amountIn: bigint,
    jettonPriceToTon: bigint,
    slippage: number,
    deadline: number,
    referralAddr: string
  ) {
    if (!userAddress) return;
    let referralAddress = beginCell().endCell();
    if (referralAddr) {
      referralAddress = beginCell()
        .storeAddress(Address.parse(referralAddr))
        .endCell();
    }

    const TON = Asset.native();
    const TOKEN = Asset.jetton(Address.parse(tokenAddress));

    try {
      const factory = client.open(
        Factory.createFromAddress(MAINNET_FACTORY_ADDR)
      );

      const TOKEN_1_ROOT = client.open(
        JettonRoot.createFromAddress(Address.parse(tokenAddress))
      );

      const TOKEN_1_WALLET = client.open(
        await TOKEN_1_ROOT.getWallet(userAddress)
      );

      const TON_TOKEN_1_POOL = client.open(
        await factory.getPool(PoolType.VOLATILE, [TON, TOKEN])
      );

      const TOKEN_1_VAULT = client.open(
        await factory.getJettonVault(Address.parse(tokenAddress))
      );

      // check if pool exists
      if (
        (await TON_TOKEN_1_POOL.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(
          `Pool (TON, ${TON_TOKEN_1_POOL.address}) does not exist`
        );
      }
      if (
        (await TOKEN_1_VAULT.getReadinessStatus()) !== ReadinessStatus.READY
      ) {
        throw new Error(`${tokenAddress} vault does not exist`);
      }

      // Estimate the amount of TON to receive
      const { amountOut: expectedAmountOut } =
        await TON_TOKEN_1_POOL.getEstimatedSwapOut({
          assetIn: TOKEN,
          amountIn,
        });

      const minAmountOut = toNano(
        (Number(fromNano(expectedAmountOut)) * 100 - slippage) / 100
      );
      console.log("Expected Amount Out (TON):", fromNano(expectedAmountOut));
      console.log("Min Amount Out (TON):", fromNano(minAmountOut));

      return await TOKEN_1_WALLET.sendTransfer(
        sender,
        toNano("0.3") + toNano(Number(fromNano(jettonPriceToTon)) * 0.01),
        {
          queryId: 0,
          amount: amountIn,
          destination: userSwapAggregatorAddress,
          responseAddress: userAddress,
          customPayload: new Cell(),
          forwardAmount: toNano("0.25"),
          forwardPayload: beginCell()
            .storeRef(
              VaultJetton.createSwapPayload({
                poolAddress: TON_TOKEN_1_POOL.address,
                limit: minAmountOut,
                swapParams: { recipientAddress: userAddress, deadline },
              })
            )
            .storeCoins(jettonPriceToTon) //jetton converted to ton
            .storeAddress(
              (
                await TOKEN_1_ROOT.getWallet(userSwapAggregatorAddress)
              ).address
            )
            .storeAddress(TOKEN_1_VAULT.address)
            .storeRef(referralAddress)
            .endCell(),
        }
      );
    } catch (err) {
      console.log("jettonToTon", err.message);
    }
  }

  static async withDrawExcessTon(
    swapAggregator: OpenedContract<SwapAggregator>,
    sender: Sender,
    amount: bigint
  ) {
    try {
      return await swapAggregator.sendWithdrawExcessTon(
        sender,
        toNano("0.02"),
        amount
      );
    } catch (err) {
      console.log("withDrawTon", err.message);
    }
  }
}
