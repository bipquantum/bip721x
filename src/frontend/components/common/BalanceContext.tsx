import React, { createContext, useContext } from "react";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { Account } from "../../../declarations/bip721_ledger/bip721_ledger.did";

interface BalanceContextType {
  balance: bigint | undefined;
  refreshBalance: (account: [Account]) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: balance, call: refreshBalance } = bqcLedgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
  });

  return (
    <BalanceContext.Provider value={{ balance, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
