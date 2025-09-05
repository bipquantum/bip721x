import { LedgerType } from "../hooks/useFungibleLedger";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import { getTokenLogo, getTokenName, getTokenSymbol } from "../../utils/metadata";

interface TokenBalanceCardProps {
  ledgerType: LedgerType;
  className?: string;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({ 
  ledgerType,
  className = ""
}) => {
  const { ckbtcLedger, bqcLedger } = useFungibleLedgerContext();
  
  // Select the appropriate ledger based on type
  const ledger = ledgerType === LedgerType.CK_BTC ? ckbtcLedger : bqcLedger;
  
  const tokenSymbol = getTokenSymbol(ledger.metadata);
  const tokenLogo = getTokenLogo(ledger.metadata);
  const tokenName = getTokenName(ledger.metadata);

  // Get balance and USD amount from the ledger
  const balance = ledger.formatAmount(ledger.userBalance);
  const usdAmount = ledger.formatAmountUsd(ledger.userBalance);
  const isLoading = ledger.userBalance === undefined;

  return (
    <div className={`flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Token Logo */}
        <img 
          src={tokenLogo} 
          alt={`${tokenSymbol} logo`} 
          className="size-8 rounded-full" 
        />
        
        {/* Token Name */}
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-black dark:text-white">
            {tokenSymbol}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tokenName}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-end">
        {isLoading ? (
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        ) : (
          <>
            <span className="text-lg font-bold text-black dark:text-white">
              {balance || "0"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {usdAmount || "$0.00"}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TokenBalanceCard;