import { useState, useEffect } from "react";
import { MdClose, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { LedgerType } from "../hooks/useFungibleLedger";
import WalletRow from "./WalletRow";

interface WalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const Wallet = ({ isOpen, onClose }: WalletProps) => {
  const [activeCard, setActiveCard] = useState<LedgerType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger transition
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Remove from DOM after animation completes
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleCardClick = (ledgerType: LedgerType) => {
    // Toggle: if clicking the already active card, hide it; otherwise show the new one
    setActiveCard(activeCard === ledgerType ? null : ledgerType);
  };

  // Close drawer when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end transition-all duration-300 ease-in-out ${
        isVisible ? "bg-black/50" : "bg-black/0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`h-full w-full sm:w-96 transform bg-white shadow-lg transition-transform duration-300 ease-out dark:bg-gray-800 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MdOutlineAccountBalanceWallet size={24} className="text-black dark:text-white" />
            <h2 className="text-xl font-semibold text-black dark:text-white">Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-4">
          <WalletRow 
            ledgerType={LedgerType.CK_BTC}
            showActions={activeCard === LedgerType.CK_BTC}
            onCardClick={handleCardClick}
            isActive={activeCard === null || activeCard === LedgerType.CK_BTC}
          />
          <WalletRow 
            ledgerType={LedgerType.BQC}
            showActions={activeCard === LedgerType.BQC}
            onCardClick={handleCardClick}
            isActive={activeCard === null || activeCard === LedgerType.BQC}
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;