import { useState } from "react";
import Modal from "./Modal";
import { LedgerType } from "../hooks/useFungibleLedger";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import TokenBalanceCard from "./TokenBalanceCard";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol: string;
  ledgerType: LedgerType;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, tokenSymbol, ledgerType }) => {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  
  const { ckbtcLedger, bqcLedger } = useFungibleLedgerContext();
  const ledger = ledgerType === LedgerType.CK_BTC ? ckbtcLedger : bqcLedger;

  const handleReviewSend = () => {
    // TODO: Implement review send functionality
    console.log("Review send:", { address, amount, tokenSymbol });
  };

  return (
    <Modal isVisible={isOpen} onClose={onClose} title={`Send ${tokenSymbol}`}>
      {/* Current Balance */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
        <TokenBalanceCard ledgerType={ledgerType} />
      </div>

      {/* Address Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          Recipient Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter recipient address or principal ID"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
        />
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          Amount to Send
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="any"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
          />
          <span className="absolute right-3 top-2.5 text-sm text-gray-500 dark:text-gray-400">
            {tokenSymbol}
          </span>
        </div>
        {amount && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ≈ {ledger.formatAmountUsd(ledger.convertToFixedPoint(parseFloat(amount) || 0))}
          </p>
        )}
      </div>

      {/* Review Send Button */}
      <button
        onClick={handleReviewSend}
        disabled={!address || !amount || parseFloat(amount) <= 0}
        className="w-full rounded-lg bg-primary px-4 py-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
      >
        Review Send
      </button>
    </Modal>
  );
};

export default SendModal;