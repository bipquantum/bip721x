import React, { useState } from "react";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export const ModalPopup: React.FC<ModalPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-2 text-center sm:block sm:p-0">
        {/* Removed click handler from this overlay */}
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-background text-left align-middle shadow-xl transition-all dark:bg-[#2F2F2F] dark:text-white w-fit">
          <div className="bg-background p-2 dark:bg-[#2F2F2F] dark:text-white sm:ml-4 sm:p-6 sm:text-left md:ml-0">
            {children}
          </div>
          <div className="items-center justify-center gap-6 bg-background px-4 py-3 dark:bg-[#2F2F2F] sm:flex sm:flex-row sm:px-6 pb-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-gradient-to-t from-primary to-secondary px-4 py-2 text-base font-medium text-white shadow-sm sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              Yes, Confirm
            </button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-black px-4 py-2 text-base font-medium text-black shadow-sm dark:border-white dark:text-white sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              No, Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
