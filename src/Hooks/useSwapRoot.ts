import { Address, OpenedContract, Sender, toNano } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useSyncInitialize } from "./useSyncInitialize";
import { SwapRoot } from "@/contracts/SwapRoot";
import { swapRootAddress } from "@/contracts/constants";
import { Root } from "./Root";

export function useSwapRoot() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const swapRoot = useSyncInitialize(() => {
    if (!client) return;
    return client.open(SwapRoot.createFromAddress(swapRootAddress));
  }, [client]);

  // methods
  return {
    initSwapAggregator: async () =>
      await Root.initializeSwapAggregator(swapRoot, sender),
  };
}
