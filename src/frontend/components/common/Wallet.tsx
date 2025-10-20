import { useState, useEffect } from "react";
import { MdClose, MdLogout, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { LedgerType } from "../hooks/useFungibleLedger";
import { useFungibleLedgerContext } from "../contexts/FungibleLedgerContext";
import { backendActor } from "../actors/BackendActor";
import { toast } from "react-toastify";
import { getTokenSymbol } from "../../utils/metadata";
import WalletRow from "./WalletRow";
import Modal from "./Modal";
import Airdrop from "../../assets/airdrop.png";
import GiftSvg from "../../assets/gift.svg";
import SpinnerSvg from "../../assets/spinner.svg";
import { useAuth } from "@nfid/identitykit/react";
import { accountToString, toAccount, truncateAccount } from "../../utils/accountUtils";
import { Link } from "react-router-dom";

interface WalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const Wallet = ({ isOpen, onClose }: WalletProps) => {
  const [activeCard, setActiveCard] = useState<LedgerType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAirdropPopupOpen, setIsAirdropPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, disconnect } = useAuth();

  // Use the modern fungible ledger context
  const { bqcLedger } = useFungibleLedgerContext();

  // Get the token symbol from metadata
  const tokenSymbol = getTokenSymbol(bqcLedger.metadata);

  // Airdrop functionality
  const { call: airdropUser, loading: airdropUserLoading } = backendActor.useUpdateCall({
    functionName: "airdrop_user",
  });

  const {
    data: isAirdropAvailable,
    call: checkAirdropAvailability,
    loading: isAirdropAvailableLoading,
  } = backendActor.useQueryCall({
    functionName: "is_airdrop_available",
  });

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger transition
      setTimeout(() => setIsVisible(true), 10);
      // Check airdrop availability when wallet opens
      checkAirdropAvailability();
    } else {
      setIsVisible(false);
      // Remove from DOM after animation completes
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const triggerAirdrop = () => {
    airdropUser().then((result) => {
      if (!result || "err" in result) {
        console.error("Failed to airdrop user:", result);
        toast.warn("Airdrop failed");
      } else {
        // Refresh BQC balance immediately on successful airdrop
        bqcLedger.refreshUserBalance();
        setIsAirdropPopupOpen(true);
        checkAirdropAvailability();
      }
    });
  };

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

  const handleCopy = () => {
    if (user) {
      navigator.clipboard.writeText(accountToString(toAccount(user)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <div className="flex flex-row items-center gap-2">
            <MdOutlineAccountBalanceWallet size={24} className="text-black dark:text-white" />
            <h2 className="text-xl font-semibold text-black dark:text-white">Wallet</h2>
            {user && (
              <div className="relative">
                <span
                  className="text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white bg-gray-200 dark:bg-gray-700 rounded-md px-3 py-1.5 text-sm font-medium hover:cursor-pointer inline-block"
                  onClick={handleCopy}
                >
                  {truncateAccount(accountToString(toAccount(user)))}
                </span>
                {copied && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    Copied!
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <Link
              className="rounded-full h-8 w-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 hover:cursor-pointer"
              onClick={()=>{ disconnect(); onClose(); }}
              to="/">
              <MdLogout />
            </Link>
            <button
              onClick={onClose}
              className="rounded-full h-8 w-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 hover:cursor-pointer"
            >
              <MdClose size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-4">
          <WalletRow 
            ledgerType={LedgerType.CK_USDT}
            showActions={activeCard === LedgerType.CK_USDT}
            onCardClick={handleCardClick}
            isActive={activeCard === null || activeCard === LedgerType.CK_USDT}
          />
          <WalletRow 
            ledgerType={LedgerType.BQC}
            showActions={activeCard === LedgerType.BQC}
            onCardClick={handleCardClick}
            isActive={activeCard === null || activeCard === LedgerType.BQC}
          />
          
          {/* Airdrop Button */}
          {isAirdropAvailable && (
            <button
              onClick={triggerAirdrop}
              className="flex h-12 items-center justify-center rounded-lg border border-primary bg-white/10 text-center text-sm font-medium text-black dark:text-white hover:bg-white/20 transition-colors"
              type="button"
              disabled={airdropUserLoading || isAirdropAvailableLoading}
            >
              {airdropUserLoading || isAirdropAvailableLoading ? (
                <img src={SpinnerSvg} alt="Loading" className="size-6" />
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <img src={Airdrop} className="size-6 animate-wiggle invert dark:invert-0" alt="Airdrop" />
                  <span>Claim airdrop</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Airdrop Success Modal */}
      <Modal
        isVisible={isAirdropPopupOpen}
        onClose={() => setIsAirdropPopupOpen(false)}
      >
        <div className="flex flex-col items-center justify-center space-y-4 px-4 pb-4">
          <img src={GiftSvg} alt="Gift" className="mx-auto h-36 w-36" />
          <h2 className="text-center text-lg font-bold text-black dark:text-white">
            {tokenSymbol} tokens have been credited to your account!
          </h2>
          <button
            onClick={() => setIsAirdropPopupOpen(false)}
            className="h-10 w-32 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Wallet;