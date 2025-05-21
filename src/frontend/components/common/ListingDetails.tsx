import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";
import { NumericFormat } from "react-number-format";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { backendActor } from "../actors/BackendActor";
import { dateToTime, fromE8s, toE8s } from "../../utils/conversions";

import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { canisterId } from "../../../declarations/backend";
import {
  ApprovalInfo,
  RevokeTokenApprovalArg,
} from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { ApproveArgs } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { useBalance } from "./BalanceContext";
import VioletButton from "./VioletButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@ic-reactor/react";
import { TbCheck, TbPencil, TbX } from "react-icons/tb";
import { IoIosPricetags } from "react-icons/io";
import { ModalPopup } from "./ModalPopup";

interface ListingDetailsProps {
  setItemPrice?: Dispatch<SetStateAction<string>>; // ✅ Use lowercase string
  principal: Principal | undefined;
  owner: Principal | undefined;
  intPropId: bigint;
  showRecommendation?: boolean;
  updateBipDetails: () => void;
  handleListClick?: (bipId: bigint) => void; // Optional with default
  handleUnlistClick?: (bipId: bigint) => void; // Optional with default
  triggered?: boolean;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  setItemPrice,
  principal,
  owner,
  intPropId,
  showRecommendation =false,
  updateBipDetails,
  handleListClick = () => {},
  handleUnlistClick = () => {},
  triggered,
}) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState<String | null>(null);

  const { refreshBalance } = useBalance();

  const { data: e8sPrice, call: getE8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  const { call: approveBqcTransfer } = bqcLedgerActor.useUpdateCall({
    functionName: "icrc2_approve",
  });

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const getListedPrice = () => {
    if (e8sPrice === undefined) {
      return null;
    }
    return "ok" in e8sPrice
      ? fromE8s(e8sPrice.ok).toFixed(TOKEN_DECIMALS_ALLOWED)
      : null;
  };
  
  useEffect(() => {
    if (setItemPrice) {
      const price1 = getListedPrice();
      setPrice(price1 || null);
      setItemPrice(price1 || "");
    }
  }, [setItemPrice, intPropId, triggered, e8sPrice]);

  useEffect(() => {
    if (triggered) {
      getE8sPrice();
    }
  }, [triggered]);

  const triggerBuy = (intPropId: bigint) => {
    if (principal === undefined || principal.isAnonymous()) {
      login();
      return;
    }

    if (e8sPrice === undefined || "ok" in e8sPrice === false) {
      throw new Error("Price not available");
    }

    const args: ApproveArgs = {
      amount: e8sPrice.ok + 10_000n,
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: {
        owner: Principal.fromText(canisterId),
        subaccount: [],
      },
      expires_at: [],
      fee: [],
      expected_allowance: [],
    };

    setIsLoading(true);

    // TODO:
    // - improve the flow by first checking the allowance and then approving the difference
    // - revert the allowance if the buy fails
    approveBqcTransfer([args])
      .then((result) => {
        if (!result || "Err" in result) {
          setIsLoading(false);
          toast.warn("Failed to approve BQC transfer");
          console.error(result ? result["Err"] : "No result");
        } else {
          buyIntProp([{ token_id: intPropId }]).then((result) => {
            setIsLoading(false);
            if (!result) {
              toast.warn("Failed to buy: undefined error");
            } else {
              if ("ok" in result) {
                toast.success("Success");
                getE8sPrice().finally(() => {
                  updateBipDetails();
                  if (principal !== undefined) {
                    refreshBalance([{ owner: principal, subaccount: [] }]);
                  }
                });
              } else {
                toast.warn("Failed to buy");
                console.error(result["err"]);
              }
            }
          });
        }
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
        toast.warn("Failed to buy");
      });
  };

  if (principal !== undefined) {
    if (owner !== undefined && owner.compareTo(principal) == "eq") {
      if (price !== null) {
        // To unlist
        return (
          <div className="mx-auto flex w-9/12 flex-row items-center justify-between gap-4">
            <div className="w-full">
              <VioletButton
                type={"unlist"}
                isLoading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  handleUnlistClick(intPropId);
                  getE8sPrice();
                }}
              >
                <p
                  className="flex flex-row gap-1 text-white"
                  style={{ filter: "grayscale(100%)" }}
                >
                  {" "}
                  <span>
                    {" "}
                    <TbX size={22} />{" "}
                  </span>{" "}
                  Unlist{" "}
                </p>
              </VioletButton>
            </div>
            <VioletButton
              type={"edit"}
              isLoading={false}
              onClick={() => console.log("handle Edit")}
            >
              <p
                className="flex flex-row gap-1"
                style={{ filter: "grayscale(100%)" }}
              >
                {" "}
                <span>
                  {" "}
                  <TbPencil size={22} />{" "}
                </span>{" "}
                Edit{" "}
              </p>
            </VioletButton>
          </div>
        );
      } else {
        // To list
        return (
          <>
            <div className="mx-auto flex w-9/12 flex-row items-center justify-between gap-4">
              <VioletButton
                type={"list"}
                isLoading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  handleListClick(intPropId);
                  getE8sPrice();
                }}
              >
                <p
                  className="flex flex-row gap-1 text-white"
                  style={{ filter: "grayscale(100%)" }}
                >
                  {" "}
                  <span>
                    {" "}
                    <TbCheck size={22} />{" "}
                  </span>{" "}
                  List{" "}
                </p>
              </VioletButton>
              <VioletButton type={"edit"} isLoading={isOpen} onClick={() => ""}>
                <p
                  className="flex flex-row gap-1"
                  style={{ filter: "grayscale(100%)" }}
                >
                  {" "}
                  <span>
                    {" "}
                    <TbPencil size={22} />{" "}
                  </span>{" "}
                  Edit{" "}
                </p>
              </VioletButton>
            </div>
          </>
        );
      }
    }
  }

  // To buy
  return (
    <div className="flex w-full flex-row items-center justify-between space-x-2 text-black dark:text-white">
      <div className="flex flex-row items-center gap-1 pl-1 text-base font-bold md:text-2xl">
        {" "}
        <span>
          <IoIosPricetags size={22} />
        </span>{" "}
        {getListedPrice()} BQC
      </div>
      <div className="w-6/12">
        <VioletButton
          type={"buy"}
          isLoading={isLoading}
          onClick={() => triggerBuy(intPropId)} //to buy
        >
          <p className="text-lg font-semibold">Buy</p>
        </VioletButton>
      </div>
    </div>
  );
};

export default ListingDetails;
