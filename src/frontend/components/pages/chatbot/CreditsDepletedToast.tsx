import React from "react";
import { toast } from "react-toastify";
import { CREDITS_DEPLETED_TOAST_ID } from "../../constants";

export const CreditsDepletedToast: React.FC = () => {
  return (
    <div>
      <p className="font-semibold mb-2">You've used all your AI credits! 🎯</p>
      <p className="mb-2">Upgrade your plan to continue chatting with AI.</p>
      <a
        href="/plans"
        className="text-blue-400 hover:text-blue-300 underline font-medium"
        onClick={() => toast.dismiss()}
      >
        View Plans →
      </a>
    </div>
  );
};

export const showCreditsDepletedToast = () => {
  // Check if toast is already active, if so, don't show another one
  if (toast.isActive(CREDITS_DEPLETED_TOAST_ID)) {
    return;
  }

  toast.info(<CreditsDepletedToast />, {
    toastId: CREDITS_DEPLETED_TOAST_ID,
    autoClose: false,
    closeButton: true,
  });
};
