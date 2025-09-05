import { useState } from "react";
import Modal from "./Modal";
import { LedgerType } from "../hooks/useFungibleLedger";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import TokenBalanceCard from "./TokenBalanceCard";
import TokenAmountInput from "./TokenAmountInput";
import { Principal } from "@dfinity/principal";
import { Account } from "../../../declarations/ckbtc_ledger/ckbtc_ledger.did";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol: string;
  ledgerType: LedgerType;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, tokenSymbol, ledgerType }) => {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };
  
  const { ckbtcLedger, bqcLedger } = useFungibleLedgerContext();
  const ledger = ledgerType === LedgerType.CK_BTC ? ckbtcLedger : bqcLedger;

  const parseRecipientAddress = (addressString: string): Account | null => {
    try {
      // Try to parse as a principal first
      const principal = Principal.fromText(addressString.trim());
      return {
        owner: principal,
        subaccount: []
      };
    } catch (error) {
      console.error("Invalid recipient address:", error);
      return null;
    }
  };

  const isValidAddress = (addressString: string): boolean => {
    return parseRecipientAddress(addressString) !== null;
  };

  const handleReviewSend = () => {
    setIsReviewMode(true);
  };

  const handleBackToEdit = () => {
    setIsReviewMode(false);
    setTransactionStatus('idle');
  };

  const handleConfirmSend = async () => {
    const recipientAccount = parseRecipientAddress(address);
    if (!recipientAccount) {
      setTransactionStatus('error');
      return;
    }

    const transferAmount = ledger.convertToFixedPoint(parseFloat(amount));
    if (!transferAmount) {
      setTransactionStatus('error');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('idle');

    try {
      const result = await ledger.transferTokens(transferAmount, recipientAccount);
      
      if ('Ok' in result) {
        setTransactionStatus('success');
        // Refresh balance after successful transfer
        ledger.refreshUserBalance();
        // Reset form after a short delay
        setTimeout(() => {
          onClose();
          setIsReviewMode(false);
          setAddress("");
          setAmount("");
          setTransactionStatus('idle');
        }, 2000);
      } else {
        console.error("Transfer failed:", result.Err);
        setTransactionStatus('error');
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setTransactionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    // Reset to initial state when modal is closed
    setIsReviewMode(false);
    setTransactionStatus('idle');
    onClose();
  };

  return (
    <Modal isVisible={isOpen} onClose={handleModalClose} title={`Send ${tokenSymbol}`}>
      {!isReviewMode ? (
        <>
          {/* Current Balance */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
            <TokenBalanceCard ledgerType={ledgerType} />
          </div>

          {/* Address Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Recipient Principal
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter recipient principal"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
            />
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <TokenAmountInput
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              tokenSymbol={tokenSymbol}
              usdValue={amount ? 
                `≈ ${ledger.formatAmountUsd(ledger.convertToFixedPoint(parseFloat(amount) || 0))}` :
                '≈ $0.00'
              }
              maxValue={ledger.convertToFloatingPoint(ledger.userBalance) || 0}
              label="Amount to Send"
            />
          </div>

          {/* Address validation message */}
          {address && !isValidAddress(address) && (
            <p className="mb-3 text-sm text-red-500">Invalid recipient address format</p>
          )}

          {/* Review Send Button */}
          <button
            onClick={handleReviewSend}
            disabled={!address || !amount || parseFloat(amount) <= 0 || !isValidAddress(address)}
            className="w-full rounded-lg bg-primary px-4 py-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
          >
            Review Send
          </button>
        </>
      ) : (
        <>
          {/* Review Screen */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Review Transaction</h3>
            
            {/* Transaction Details */}
            <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              {/* Recipient */}
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">To</span>
                <span className="text-sm font-medium text-black dark:text-white break-all text-right">{address}</span>
              </div>
              
              {/* Amount */}
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Amount</span>
                <span className="text-sm font-medium text-black dark:text-white text-right">
                  {amount} {tokenSymbol}
                </span>
              </div>
              
              {/* USD Value */}
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">USD Value</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-right">
                  {ledger.formatAmountUsd(ledger.convertToFixedPoint(parseFloat(amount)))}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Status Messages */}
          {transactionStatus === 'success' && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Transaction completed successfully!
              </p>
            </div>
          )}

          {transactionStatus === 'error' && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Transaction failed. Please try again.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBackToEdit}
              disabled={isLoading || transactionStatus === 'success'}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              Edit
            </button>
            <button
              onClick={handleConfirmSend}
              disabled={isLoading || transactionStatus === 'success'}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? 'Sending...' : transactionStatus === 'success' ? 'Sent!' : 'Confirm Send'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SendModal;