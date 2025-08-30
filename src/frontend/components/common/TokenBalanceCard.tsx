import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { LedgerType } from "../hooks/useFungibleLedger";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import { getTokenLogo, getTokenName, getTokenSymbol } from "../../utils/metadata";

interface TokenBalanceCardProps {
  ledgerType: LedgerType;
  showActions: boolean;
  onCardClick: (ledgerType: LedgerType) => void;
  isActive: boolean;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({ 
  ledgerType,
  showActions,
  onCardClick,
  isActive
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
    <div className={`rounded-lg bg-gray-50 dark:bg-gray-700 transition-opacity duration-300 ${
      isActive ? "opacity-100" : "opacity-50"
    }`}>
      {/* Main Card - Clickable */}
      <div 
        className={`flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 ${
          showActions ? "rounded-t-lg" : "rounded-lg"
        }`}
        onClick={() => onCardClick(ledgerType)}
      >
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
                {balance || "0"} {tokenSymbol}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {usdAmount || "$0.00"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 rounded-b-lg p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement send functionality
              console.log(`Send ${tokenSymbol} clicked`);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors"
          >
            <MdArrowUpward size={18} />
            Send
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement receive functionality
              console.log(`Receive ${tokenSymbol} clicked`);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
          >
            <MdArrowDownward size={18} />
            Receive
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenBalanceCard;