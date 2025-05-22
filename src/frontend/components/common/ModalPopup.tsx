import ReactDOM from "react-dom";
import React from "react";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const ModalPopup: React.FC<ModalPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  children,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative mx-auto my-8 w-full max-w-lg rounded-lg bg-background p-6 text-left shadow-xl dark:bg-[#2F2F2F] dark:text-white">
        {/* Modal content */}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-t from-primary to-secondary"
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              "Yes, Confirm"
            )}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-black px-4 py-2 text-base font-medium text-black dark:border-white dark:text-white"
            onClick={onClose}
            disabled={isLoading}
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

