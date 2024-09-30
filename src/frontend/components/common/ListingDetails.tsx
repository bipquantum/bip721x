import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";
import { NumericFormat } from "react-number-format";
import { useState } from "react";

import { backendActor } from "../actors/BackendActor";
import { fromE8s, toE8s } from "../../utils/conversions";

import SpinnerSvg from "../../assets/spinner.svg";
import { icrc7Actor } from "../actors/Icrc7Actor";
import { canisterId } from "../../../declarations/backend";
import { ApprovalInfo, RevokeTokenApprovalArg } from "../../../declarations/icrc7/icrc7.did";
import { ICP_DECIMALS_ALLOWED } from "../constants";

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
  const navigate = useNavigate();

  const [sellPrice, setSellPrice] = useState<bigint>(BigInt(0));

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const { call: approveTransfer } = icrc7Actor.useUpdateCall({
    functionName: "icrc37_approve_tokens",
  });

  const { call: revokeTransfer } = icrc7Actor.useUpdateCall({
    functionName: "icrc37_revoke_token_approvals",
  });

  const { call: listIntProp } = backendActor.useUpdateCall({
    functionName: "list_int_prop",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
  });

  const getListedPrice = () =>
    !e8sPrice ? undefined : "ok" in e8sPrice ? e8sPrice.ok : null;

  const triggerBuy = (intPropId: bigint) => {
    setIsLoading(true);
    buyIntProp([{ token_id: intPropId }]).then((result) => {
      if (!result) {
        toast.warn("Failed to buy: undefined error");
      } else {
        if ("ok" in result) {
          toast.success("Success");
          updateBipDetails();
          navigate(`/bip/${intPropId.toString()}`);
        } else {
          toast.warn("Failed to buy");
          console.error(result["err"]);
        }
      }
      setIsLoading(false);
    });
  };

  const triggerList = (intPropId: bigint, sellPrice: bigint) => {
  
    const info : ApprovalInfo = {
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      spender: {
        owner: Principal.fromText(canisterId),
        subaccount: [],
      },
      expires_at: [],
    }

    setIsLoading(true);

    approveTransfer([[{token_id: intPropId, approval_info: info}]]).then((result) => {
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
              updateBipDetails();
              navigate(`/bip/${intPropId.toString()}`);
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
      created_at_time: [],
      spender: [{
        owner: Principal.fromText(canisterId),
        subaccount: [],
      }],
    }

    revokeTransfer([[info]]).then((result) => {
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
            updateBipDetails();
            navigate(`/bip/${intPropId.toString()}`);
          }
        });
      }
    }).catch((e) => {
      setIsLoading(false);
      console.error(e);
      toast.warn("Failed to unlist");
    });
  };

  if (getListedPrice() === undefined) {
    return (
      <div>
        <h1>Error</h1>
        <p>{"Cannot find if the IP is listed or not"}</p>
      </div>
    );
  }

  const price = getListedPrice();

  if (principal !== undefined) {
    if (owner.compareTo(principal) == "eq") {
      if (getListedPrice()) {
        return (
          <div className="flex w-full items-center justify-between">
            <div className="text-primary text-lg font-bold">
              {price ? fromE8s(price).toFixed(ICP_DECIMALS_ALLOWED) : "N/A"} ICP
            </div>
            <button
              onClick={() => triggerUnlist(intPropId)}
              className="flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
              disabled={isLoading}
            >
              {isLoading ? <img src={SpinnerSvg} alt="" /> : "Unlist"}
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row gap-2">
            <label
              htmlFor="e8sIcpPrice"
              className="flex items-center justify-center text-nowrap text-sm font-medium"
            >
              List for (ICP)
            </label>
            <NumericFormat
              className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400"
              thousandSeparator=","
              decimalScale={ICP_DECIMALS_ALLOWED}
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
              className="flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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

  return (
    <div className="flex w-full items-center justify-between">
      <div className="text-primary text-lg font-bold">
        {price ? fromE8s(price).toFixed(ICP_DECIMALS_ALLOWED) : "N/A"} ICP
      </div>
      <button
        onClick={() => triggerBuy(intPropId)}
        className="flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        disabled={isLoading}
      >
        {isLoading ? <img src={SpinnerSvg} alt="" /> : "Buy"}
      </button>
    </div>
  );
};

export default ListingDetails;
