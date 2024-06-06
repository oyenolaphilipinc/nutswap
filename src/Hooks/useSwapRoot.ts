import { Address, OpenedContract, Sender, fromNano, toNano } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useSyncInitialize } from "./useSyncInitialize";
import { SwapRoot } from "@/contracts/SwapRoot";
import { swapRootAddress } from "@/contracts/constants";
import { Root } from "./Root";
import { useEffect, useState } from "react";

export function useSwapRoot() {
  const client = useTonClient();
  const { sender } = useTonConnect();
  const [fixedFee, setFixedFee] = useState<bigint | null>();

  const swapRoot = useSyncInitialize(() => {
    if (!client) return;
    return client.open(SwapRoot.createFromAddress(swapRootAddress));
  }, [client]);

  useEffect(() => {
    if (!swapRoot) return;
    const rootData = async () => {
      try {
        setFixedFee(null);
        const { fixedFee: fee } = await swapRoot.getSwapRootData();
        setFixedFee(toNano(fromNano(fee)));
      } catch (err) {
        console.log("rootData func", err.message);
      }
    };
    rootData();
    return () => {};
  }, [swapRoot]);

  // methods
  return {
    fixedFee,
    initSwapAggregator: async () =>
      await Root.initializeSwapAggregator(swapRoot, sender),
  };
}
