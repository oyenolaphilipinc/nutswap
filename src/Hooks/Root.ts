import { OpenedContract, Sender, toNano } from "@ton/core";
import { SwapRoot } from "@/contracts/SwapRoot";

export class Root {
  static async initializeSwapAggregator(
    swapRoot: OpenedContract<SwapRoot>,
    sender: Sender
  ) {
    try {
      return await swapRoot.sendInitializeAggregator(sender, toNano("0.05"));
    } catch (err) {
      console.log("initializeSwapAggregator", err.message);
    }
  }
}
