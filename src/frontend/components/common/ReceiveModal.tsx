import { useState, useEffect, useRef } from "react";
import { MdContentCopy } from "react-icons/md";
import { useAuth } from "@nfid/identitykit/react";
import QRCode from "qrcode";
import Modal from "./Modal";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose, tokenSymbol }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const userPrincipal = user?.principal?.toString();

  // Generate QR code when modal opens and user principal is available
  useEffect(() => {
    if (isOpen && userPrincipal && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, userPrincipal, {
        width: 192, // 12rem equivalent
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [isOpen, userPrincipal]);

  const handleCopy = async () => {
    if (userPrincipal) {
      try {
        await navigator.clipboard.writeText(userPrincipal);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <Modal isVisible={isOpen} onClose={onClose} title={`Receive ${tokenSymbol}`}>
      {!userPrincipal ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Please connect your wallet to receive tokens</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* QR Code */}
          <div className="mb-6 flex h-48 w-48 items-center justify-center rounded-lg bg-white p-2">
            <canvas
              ref={canvasRef}
              className="max-h-full max-w-full"
            />
          </div>

          {/* Principal Address */}
          <div className="mb-4 w-full">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Your Principal ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={userPrincipal}
                readOnly
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white truncate"
                title={userPrincipal} // Show full principal on hover
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                title="Copy to clipboard"
              >
                <MdContentCopy size={16} />
              </button>
            </div>
          </div>

          {/* Copy Success Message */}
          {copied && (
            <p className="mb-4 text-sm text-green-600 dark:text-green-400">
              Address copied to clipboard!
            </p>
          )}

          {/* Instructions */}
          <div className="w-full max-w-sm rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed break-words">
              Share this Principal ID with others to receive {tokenSymbol} tokens. 
              Make sure to double-check the address before sharing.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReceiveModal;