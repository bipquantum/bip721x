import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";
import { NumericFormat } from "react-number-format";
import { useState } from "react";

import { backendActor } from "../actors/BackendActor";
import { dateToTime, fromE8s, toE8s } from "../../utils/conversions";

import SpinnerSvg from "../../assets/spinner.svg";
import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { canisterId } from "../../../declarations/backend";
import { ApprovalInfo, RevokeTokenApprovalArg } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { ApproveArgs } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { useBalance } from "./BalanceContext";

interface ListingDetailsProps {
  principal: Principal | undefined;
  owner: Principal;
  intPropId: bigint;
  updateBipDetails: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  principal,
  owner,
  intPropId,
  updateBipDetails,
}) => {
  
  const [isLoading, setIsLoading] = useState(false);
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
    };
    return "ok" in e8sPrice ? fromE8s(e8sPrice.ok).toFixed(TOKEN_DECIMALS_ALLOWED) : null;
  }

  const triggerBuy = (intPropId: bigint) => {

    if (e8sPrice === undefined || "ok" in e8sPrice === false) {
      throw new Error("Price not available");
    };

    const args : ApproveArgs = {
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
    }

    setIsLoading(true);

    // TODO: 
    // - improve the flow by first checking the allowance and then approving the difference
    // - revert the allowance if the buy fails
    console.log("Approving BQC transfer");
    approveBqcTransfer([args]).then((result) => {
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
                if (principal !== undefined){
                  refreshBalance([{ owner: principal, subaccount: [] }]);
                };
              });
            } else {
              toast.warn("Failed to buy");
              console.error(result["err"]);
            }
          }
        });
      }
    }).catch((e) => {
      setIsLoading(false);
      console.error(e);
      toast.warn("Failed to buy");
    });
  };

  const triggerList = (intPropId: bigint, sellPrice: bigint) => {
  
    const info : ApprovalInfo = {
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: {
        owner: Principal.fromText(canisterId),
        subaccount: [],
      },
      expires_at: [],
    }

    setIsLoading(true);

    approveBip721Transfer([[{token_id: intPropId, approval_info: info}]]).then((result) => {
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
                updateBipDetails();
              });
            }
          },
        );
      }
    }).catch((e) => {
      setIsLoading(false);
      console.error(e);
      toast.warn("Failed to list");
    });
    
  };

  const triggerUnlist = (intPropId: bigint) => {
    setIsLoading(true);

    const info : RevokeTokenApprovalArg = {
      token_id: intPropId,
      memo: [],
      from_subaccount: [],
      created_at_time: [dateToTime(new Date())],
      spender: [{
        owner: Principal.fromText(canisterId),
        subaccount: [],
      }],
    }

    revokeBip721Transfer([[info]]).then((result) => {
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
    }).catch((e) => {
      setIsLoading(false);
      console.error(e);
      toast.warn("Failed to unlist");
    });
  };

  if (principal !== undefined) {
    if (owner.compareTo(principal) == "eq") {
      if (getListedPrice() !== null) {
        // To unlist
        return (
          <div className="flex w-full items-center space-x-2">
            <div className="text-lg font-bold">
              { getListedPrice() } bQC
            </div>
            <button
              onClick={() => triggerUnlist(intPropId)}
              className="items-center justify-center rounded-lg bg-violet-700 w-32 py-2.5 text-center text-sm font-medium text-white hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700 dark:focus:ring-violet-800"
              type="button"
              disabled={isLoading}
            >
              {isLoading ? <img src={SpinnerSvg} alt="" /> : "Unlist"}
            </button>
          </div>
        );
      } else {
        // To list
        return (
          <div className="flex flex-row gap-2">
            <label
              htmlFor="e8sIcpPrice"
              className="flex items-center justify-center text-nowrap text-sm font-medium"
            >
              List for (bQC)
            </label>
            <NumericFormat
              className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400"
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
            />
            <button
              onClick={() => triggerList(intPropId, sellPrice)}
              className="items-center justify-center rounded-lg bg-violet-700 w-32 py-2.5 text-center text-sm font-medium text-white hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700 dark:focus:ring-violet-800"
              type="button"
              disabled={isLoading}
            >
              {isLoading ? <img src={SpinnerSvg} alt="" /> : "List"}
            </button>
          </div>
        );
      }
    }
  }

  // To buy
  return (
    <div className="flex w-full items-center justify-between">
      <div className="text-primary text-lg font-bold">
        { getListedPrice() } bQC
      </div>
      <button
        onClick={() => triggerBuy(intPropId)}
        className="items-center justify-center rounded-lg bg-violet-700 w-32 py-2.5 text-center text-sm font-medium text-white hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700 dark:focus:ring-violet-800"
        type="button"
        disabled={isLoading}
      >
        {isLoading ? <img src={SpinnerSvg} alt="" /> : "Buy"}
      </button>
    </div>
  );
};

export default ListingDetails;
