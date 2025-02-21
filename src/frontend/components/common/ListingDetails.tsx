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
  owner: Principal;
  intPropId: bigint;
  showRecommendation?: boolean;
  updateBipDetails: () => void;
  onListClick?: () => void;
  onUnlistingClick?: () => void;
  onEditingClick?: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  setItemPrice,
  principal,
  owner,
  intPropId,
  showRecommendation,
  updateBipDetails,
  onListClick,
  onUnlistingClick,
  onEditingClick,
}) => {
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState<bigint>(BigInt(0));

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

  const { call: approveBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_approve_tokens",
  });

  const { call: revokeBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_revoke_token_approvals",
  });

  const { call: listIntProp } = backendActor.useUpdateCall({
    functionName: "list_int_prop",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
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
      setItemPrice(price1 || "");
    }
  }, [setItemPrice]);
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
          console.log("Buying IP");
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

  const triggerList = (intPropId: bigint, sellPrice: bigint) => {
    const info: ApprovalInfo = {
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: {
        owner: Principal.fromText(canisterId),
        subaccount: [],
      },
      expires_at: [],
    };

    setIsLoading(true);

    approveBip721Transfer([[{ token_id: intPropId, approval_info: info }]])
      .then((result) => {
        if (!result || "Err" in result) {
          setIsLoading(false);
          toast.warn("Failed to approve IP transfer");
          console.error(result ? result["Err"] : "No result");
        } else {
          listIntProp([{ token_id: intPropId, e8s_icp_price: sellPrice }]).then(
            (result) => {
              setIsLoading(false);
              if (!result || "err" in result) {
                toast.warn("Failed to list IP");
                console.error(result ? result["err"] : "No result");
              } else {
                toast.success("Success");
                getE8sPrice().finally(() => {
                  const details = updateBipDetails();
                });
              }
            },
          );
        }
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
        toast.warn("Failed to list");
      });
  };

  const triggerUnlist = (intPropId: bigint) => {
    setIsLoading(true);

    const info: RevokeTokenApprovalArg = {
      token_id: intPropId,
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: [
        {
          owner: Principal.fromText(canisterId),
          subaccount: [],
        },
      ],
    };

    revokeBip721Transfer([[info]])
      .then((result) => {
        if (!result || "Err" in result) {
          setIsLoading(false);
          toast.warn("Failed to revoke IP transfer");
          console.error(result ? result["Err"] : "No result");
        } else {
          unlistIntProp([{ token_id: intPropId }]).then((result) => {
            setIsLoading(false);
            if (!result || "err" in result) {
              toast.warn("Failed to unlist");
              console.error(result ? result["err"] : "No result");
            } else {
              toast.success("Success");
              getE8sPrice().finally(() => {
                updateBipDetails();
              });
            }
          });
        }
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
        toast.warn("Failed to unlist");
      });
  };

  const handleListClick = () => {
    setIsListModalOpen(true);
  };

  const handleSave = () => {
    triggerList(intPropId, sellPrice);
    setIsListModalOpen(false);
  };

  if (principal !== undefined) {
    if (owner.compareTo(principal) == "eq") {
      if (getListedPrice() !== null) {
        // To unlist
        return (
          <div className="mx-auto flex w-9/12 flex-row items-center justify-between gap-4">
            {/* <div className="text-lg font-bold">{getListedPrice()} bQC</div> */}
            <div className="w-full">
              <VioletButton
                type={"unlist"}
                isLoading={isLoading}
                onClick={() => triggerUnlist(intPropId)} //to unlist
                // onClick={() => onUnlistingClick}
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
              onClick={() => console.log('clicked')}
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
            {/* <div className="relative flex w-full flex-col items-center space-y-1"> */}
              <div className="mx-auto flex w-9/12 flex-row items-center justify-between gap-4 ">
                {/* <NumericFormat
                className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 ml-1 block w-full rounded-lg border border-gray-300 bg-white p-1.5 text-right text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400"
                thousandSeparator=","
                decimalScale={TOKEN_DECIMALS_ALLOWED}
                value={Number(fromE8s(sellPrice))}
                onValueChange={(e) => {
                  setSellPrice(
                    toE8s(
                      parseFloat(
                        e.value === "" ? "0" : e.value.replace(/,/g, ""),
                      ),
                    ),
                  );
                }}
                prefix="bQC "
                spellCheck="false"
              /> */}
                <VioletButton
                  type={"list"}
                  isLoading={isLoading}
                  onClick={() => triggerList(intPropId, sellPrice)} // to list
                  // onClick={onListClick}
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
                <VioletButton
                  type={"edit"}
                  isLoading={isOpen}
                  onClick={() => ""}
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
              {/* {showRecommendation === true && (
                <div className="item-center absolute -bottom-4 whitespace-nowrap text-xs">
                  Recommended price: 1 to 50 bQC
                </div>
              )}
            </div> */}
          </>
        );
      }
    }
  }

  // To buy
  return (
    <div className="flex w-full flex-row items-center justify-between space-x-2  text-black dark:text-white">
      <div className="flex flex-row items-center gap-1 pl-1 text-2xl font-bold">
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
