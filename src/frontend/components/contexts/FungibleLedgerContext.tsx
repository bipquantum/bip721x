import { createContext, useContext, ReactNode } from "react";
import { useFungibleLedger, LedgerType, FungibleLedger } from "../hooks/useFungibleLedger";

interface FungibleLedgerContextType {
  ckbtcLedger: FungibleLedger;
  bqcLedger: FungibleLedger;
}

const FungibleLedgerContext = createContext<FungibleLedgerContextType | undefined>(undefined);

export const FungibleLedgerProvider = ({ children }: { children: ReactNode }) => {
  const ckbtcLedger = useFungibleLedger(LedgerType.CK_BTC);
  const bqcLedger = useFungibleLedger(LedgerType.BQC);

  return (
    <FungibleLedgerContext.Provider value={{ ckbtcLedger, bqcLedger }}>
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
