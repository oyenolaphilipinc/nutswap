import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useSyncInitialize } from "./useSyncInitialize";
import { SwapRoot } from "@/contracts/SwapRoot";
import { swapRootAddress } from "@/contracts/constants";
import { useAsyncInitialze } from "./useAsyncInitialize";
import { Address, toNano } from "@ton/core";
import { SwapAggregator } from "@/contracts/SwapAggregator";
import { Swap } from "./Swap";
import { TonClient4 } from "@ton/ton";
import { useSwapRoot } from "./useSwapRoot";

export function useSwapAggregator() {
  const client = useTonClient();
  const { sender, userAddress } = useTonConnect();

  const address = userAddress ? Address.parse(userAddress) : undefined;

  const [noReferred, setNoReferred] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [userSwapAggregatorAddress, setUserSwapAggregatorAddress] =
    useState<Address>();

  const [userAggregatorStatus, setUserAggregatorStatus] = useState(false);

  const { gas } = useSwapRoot();

  // open swap root contract
  const swapRoot = useSyncInitialize(() => {
    if (!client) return;
    return client.open(SwapRoot.createFromAddress(swapRootAddress));
  }, [client]);

  // open user aggregator contract
  const swapAggregator = useAsyncInitialze(async () => {
    if (!swapRoot) return;
    if (!address) return;
    // user swap aggregator address
    try {
      const userSwapAggregatorAddr = await swapRoot.getUserAggregatorAddress(
        address
      );

      setUserSwapAggregatorAddress(userSwapAggregatorAddr);

      return client.open(
        SwapAggregator.createFromAddress(userSwapAggregatorAddr)
      );
    } catch (err) {
      console.log(err.message);
    }
  }, [swapRoot, address]);

  useEffect(() => {
    if (!swapAggregator) return;
    const aggregatorData = async () => {
      try {
        const { noReferredUsers, earned } =
          await swapAggregator.getSwapAggregatorData();

        setNoReferred(noReferredUsers);
        setReferralEarnings(earned);
      } catch (err) {
        console.log(err.message);
      }
    };
    aggregatorData();
    return () => {};
  }, [swapAggregator]);

  useEffect(() => {
    if (!userSwapAggregatorAddress) return;
    async function contractStatus() {
      try {
        const latestBlock = await client.getLastBlock();

        const status = await client.getAccount(
          latestBlock.last.seqno,
          userSwapAggregatorAddress
        );

        if (status.account.state.type !== "active") {
          return setUserAggregatorStatus(false);
        }
        if (status.account.state.type == "active") {
          return setUserAggregatorStatus(true);
        }
      } catch (err) {
        console.log("contractStatus func", err.message);
      }
    }
    contractStatus();
    return () => {};
  }, [userSwapAggregatorAddress]);

  // methods //
  return {
    noReferred,
    referralEarnings,
    userAggregatorStatus,

    swapTonForJetton: async (
      tokenAddress: string,
      amountIn: bigint,
      slippage = 1,
      deadline = 5,
      referralAddr = ""
    ) =>
      await Swap.tonToJetton(
        swapAggregator,
        sender,
        address,
        client,
        tokenAddress,
        amountIn,
        gas,
        slippage,
        deadline,
        referralAddr
      ),

    swapJettonForJetton: async (
      tokenAddress1: string,
      tokenAddress2: string,
      amountIn: bigint,
      jettonPriceToTon: bigint,
      limit = toNano(0),
      deadline = 5,
      referralAddr = ""
    ) =>
      await Swap.jettonToJetton(
        sender,
        address,
        userSwapAggregatorAddress,
        client,
        tokenAddress1,
        tokenAddress2,
        amountIn,
        jettonPriceToTon,
        limit,
        deadline,
        referralAddr
      ),

    swapJettonForTon: async (
      tokenAddress: string,
      amountIn: bigint,
      jettonPriceToTon: bigint,
      slippage = 1,
      deadline = 5,
      referralAddr = ""
    ) =>
      await Swap.jettonToTon(
        sender,
        address,
        userSwapAggregatorAddress,
        client,
        tokenAddress,
        amountIn,
        jettonPriceToTon,
        slippage,
        deadline,
        referralAddr
      ),

    withDrawTon: async (amount: bigint) =>
      await Swap.withDrawExcessTon(swapAggregator, sender, amount),

    withdrawJetton: async () =>
      await Swap.withdrawJetton(client, sender, address),
  };
}
