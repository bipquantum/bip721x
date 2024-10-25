import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { fromE8s } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";

import SpinnerSvg from "../../assets/spinner.svg";
import { toast } from "react-toastify";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { backendActor } from "../actors/BackendActor";
import { useEffect } from "react";

type BalanceProps = {
  principal: Principal;
};

const Balance = ({ principal }: BalanceProps) => {

  const { data: balance, call: refreshBalance } = bqcLedgerActor.useQueryCall({
    functionName: "icrc1_balance_of",
    args: [
      {
        owner: principal,
        subaccount: [],
      },
    ],
  });

  const { call: aidropUser, loading: airdropUserLoading } = backendActor.useUpdateCall({
    functionName: "airdrop_user",
  });

  const { data: isAirdropAvailable, call: checkAirdropAvailability, loading: isAirdropAvailableLoading } = backendActor.useQueryCall({
    functionName: "is_airdrop_available",
  });

  const triggerAirdrop = () => {

    console.log("Triggering airdrop");

    aidropUser().then((result) => {
      if (!result || "err" in result) {
        console.error("Failed to airdrop user:", result);
        toast.warn("Airdrop failed");
      } else {
        toast.success("Airdrop succeeded!");
        checkAirdropAvailability();
        refreshBalance();
      }
    });
  };

  useEffect(() => {
    checkAirdropAvailability();
  }
  , []);

  return (
    <div className="flex flex-row items-center gap-2 text-sm sm:text-xl">
      <span>Balance: {fromE8s(balance ?? 0n).toFixed(TOKEN_DECIMALS_ALLOWED)} bQC</span>
      <button
        onClick={() => triggerAirdrop()}
        className={`flex items-center justify-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white  dark:text-white ${isAirdropAvailable ? "bg-blue-700 hover:enabled:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 " : "bg-gray-400 cursor-not-allowed"}`}
        type="button"
        disabled={airdropUserLoading || isAirdropAvailableLoading || !isAirdropAvailable}
      >
        {airdropUserLoading ? <img src={SpinnerSvg} alt="" /> : "Airdrop"}
      </button>
    </div>
  );
};

export default Balance;
