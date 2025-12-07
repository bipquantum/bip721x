import React from "react";
import { toast } from "react-toastify";

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
  toast.info(<CreditsDepletedToast />, {
    autoClose: false,
    closeButton: true,
  });
};
