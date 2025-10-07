import { createContext, useContext, ReactNode } from "react";
import { useFungibleLedger, LedgerType, FungibleLedger } from "../hooks/useFungibleLedger";

interface FungibleLedgerContextType {
  ckusdtLedger: FungibleLedger;
  bqcLedger: FungibleLedger;
}

const FungibleLedgerContext = createContext<FungibleLedgerContextType | undefined>(undefined);

export const FungibleLedgerProvider = ({ children }: { children: ReactNode }) => {
  const ckusdtLedger = useFungibleLedger(LedgerType.CK_USDT);
  const bqcLedger = useFungibleLedger(LedgerType.BQC);

  return (
    <FungibleLedgerContext.Provider value={{ ckusdtLedger, bqcLedger }}>
      {children}
    </FungibleLedgerContext.Provider>
  );
};

export const useFungibleLedgerContext = () => {
  const context = useContext(FungibleLedgerContext);
  if (!context) {
    throw new Error("useFungibleLedgerContext must be used within a FungibleLedgerProvider");
  }
  return context;
};
