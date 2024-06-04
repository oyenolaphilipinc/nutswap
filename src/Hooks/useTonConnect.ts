import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { Address, Sender, SenderArguments } from "@ton/core";
import { useState, useEffect } from 'react';

export function useTonConnect(): {
  sender: Sender | null;
  connected: boolean;
  userAddress: string | null;
} {
  const [tonConnectUI] = useTonConnectUI();
  const TONAddress = useTonAddress(true);

  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [sender, setSender] = useState<Sender | null>(null);

  useEffect(() => {
    if (tonConnectUI && TONAddress) {
      setConnected(tonConnectUI.connected);
      setUserAddress(TONAddress);
      setSender({
        send: async (args: SenderArguments) => {
          await tonConnectUI.sendTransaction({
            messages: [
              {
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString("base64"),
              },
            ],
            validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
          });
        },
        address: Address.parse(TONAddress),
      });
    }
  }, [tonConnectUI, TONAddress]);

  return {
    sender,
    connected,
    userAddress,
  };
}
