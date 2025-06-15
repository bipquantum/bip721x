import { fromE8s } from "../../utils/conversions";
import { Principal } from "@dfinity/principal";

import SpinnerSvg from "../../assets/spinner.svg";
import Airdrop from "../../assets/airdrop.png";
import GiftSvg from "../../assets/gift.svg";
import { toast } from "react-toastify";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { backendActor } from "../actors/BackendActor";
import { useEffect, useState } from "react";
import { useBalance } from "./BalanceContext";
import Modal from "./Modal";

type BalanceProps = {
  principal: Principal;
};

const Balance = ({ principal }: BalanceProps) => {
  const { balance, refreshBalance } = useBalance();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { call: airdropUser, loading: airdropUserLoading } =
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

    airdropUser().then((result) => {
      if (!result || "err" in result) {
        console.error("Failed to airdrop user:", result);
        toast.warn("Airdrop failed");
      } else {
        setIsPopupOpen(true);
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
        Your balance: {fromE8s(balance ?? 0n).toFixed(TOKEN_DECIMALS_ALLOWED)} BQC
      </span>
      {
        isAirdropAvailable ?
        <button
          onClick={() => triggerAirdrop()}
          className={`flex items-center justify-center rounded-lg bg-white/10 w-48 h-12 text-center text-sm font-medium text-black dark:text-white border border-primary`}
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
      <Modal
          isVisible={isPopupOpen}
          onClose={() => {setIsPopupOpen(false)}}
      >
        <div className="flex flex-col items-center justify-center px-4 pb-4 space-y-4">
          <img src={GiftSvg} alt="Gift" className="mx-auto h-36 w-36" />
          <h2 className="text-center text-lg font-bold text-black dark:text-white">1000.00 BQC have been credited to your account!</h2>
          <button
            onClick={() => {setIsPopupOpen(false)}}
            className="w-32 h-10 rounded-lg bg-primary text-white"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Balance;
