import { MdClose, MdAccountBalanceWallet } from "react-icons/md";
import { Principal } from "@dfinity/principal";
import { LedgerType } from "../hooks/useFungibleLedger";
import TokenBalanceCard from "./TokenBalanceCard";

interface WalletProps {
  isOpen: boolean;
  onClose: () => void;
  principal: Principal;
}

const Wallet = ({ isOpen, onClose, principal }: WalletProps) => {
  // Close drawer when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className={`h-full w-96 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MdAccountBalanceWallet size={24} className="text-black dark:text-white" />
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
          {/* ckBTC Balance */}
          <TokenBalanceCard
            ledgerType={LedgerType.CK_BTC}
          />

          {/* BQC Balance */}
          <TokenBalanceCard
            ledgerType={LedgerType.BQC}
          />
        </div>
      </div>
    </div>
  );
};

export default Wallet;