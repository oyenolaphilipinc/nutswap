import { useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useSyncInitialize } from "./useSyncInitialize";
import { SwapRoot } from "@/contracts/SwapRoot";
import { swapRootAddress } from "@/contracts/constants";
import { useAsyncInitialze } from "./useAsyncInitialize";
import { Address, toNano } from "@ton/core";
import { SwapAggregator } from "@/contracts/SwapAggregator";
import { Swap } from "./Swap";

export function useSwapAggregator() {
  const client = useTonClient();
  const { sender, userAddress } = useTonConnect();

  const address = Address.parse(userAddress);

  const [noReferred, setNoReferred] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [userSwapAggregatorAddress, setUserSwapAggregatorAddress] =
    useState<Address>();
  // open swap root contract
  const swapRoot = useSyncInitialize(() => {
    if (!client) return;
    return client.open(SwapRoot.createFromAddress(swapRootAddress));
  }, [client]);

  // open user aggregator contract
  const swapAggregator = useAsyncInitialze(async () => {
    if (!client) return;
    if (!swapRoot) return;
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
  }, [client, swapRoot, address, userSwapAggregatorAddress]);

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
  }, [swapAggregator, noReferred, referralEarnings]);

  // methods //
  return {
    noReferred,
    referralEarnings,

    swapTonForJetton: async (
      tokenAddress: string,
      amountIn: bigint,
      limit = toNano(0),
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
        limit,
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

    withDrawTon: async (amount: bigint) =>
      await Swap.withDrawExcessTon(swapAggregator, sender, amount),
  };
}
