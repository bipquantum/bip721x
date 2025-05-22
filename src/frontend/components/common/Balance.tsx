import { fromE8s } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";

import SpinnerSvg from "../../assets/spinner.svg";
import Airdrop from "../../assets/airdrop.png";
import { toast } from "react-toastify";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { backendActor } from "../actors/BackendActor";
import { useEffect } from "react";
import { useBalance } from "./BalanceContext";

type BalanceProps = {
  principal: Principal;
};

const Balance = ({ principal }: BalanceProps) => {
  const { balance, refreshBalance } = useBalance();

  const { call: aidropUser, loading: airdropUserLoading } =
    backendActor.useUpdateCall({
      functionName: "airdrop_user",
    });

  const {
    data: isAirdropAvailable,
    call: checkAirdropAvailability,
    loading: isAirdropAvailableLoading,
  } = backendActor.useQueryCall({
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
        refreshBalance([
          {
            owner: principal,
            subaccount: [],
          },
        ]);
      }
    });
  };

  useEffect(() => {
    refreshBalance([{ owner: principal, subaccount: [] }]);
    checkAirdropAvailability();
  }, []);

  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 text-sm sm:text-xl">
      <span>
        Balance: {fromE8s(balance ?? 0n).toFixed(TOKEN_DECIMALS_ALLOWED)} BQC
      </span>
      {
        isAirdropAvailable ?
        <button
          onClick={() => triggerAirdrop()}
          className={`flex items-center justify-center rounded-lg bg-white/10 px-5 py-2.5 text-center text-sm font-medium text-black dark:text-white border border-primary`}
          type="button"
          disabled={airdropUserLoading || isAirdropAvailableLoading}
        >
          {airdropUserLoading || isAirdropAvailableLoading ? (
            <img src={SpinnerSvg} alt="" />
          ) : (
            <div className="flex flex-row items-center gap-1 md:text-lg">
              <img src={Airdrop} className="size-[24px] animate-wiggle" />
              <span>Claim airdrop</span>
            </div>
          )}
        </button>
        :
        <></>
      }
    </div>
  );
};

export default Balance;
