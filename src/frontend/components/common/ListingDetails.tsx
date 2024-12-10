import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";
import { NumericFormat } from "react-number-format";
import { useState } from "react";

import { backendActor } from "../actors/BackendActor";
import { dateToTime, fromE8s, toE8s } from "../../utils/conversions";

import { bip721LedgerActor } from "../actors/Bip721LedgerActor";
import { canisterId } from "../../../declarations/backend";
import { ApprovalInfo, RevokeTokenApprovalArg } from "../../../declarations/bip721_ledger/bip721_ledger.did";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { bqcLedgerActor } from "../actors/BqcLedgerActor";
import { ApproveArgs } from "../../../declarations/bqc_ledger/bqc_ledger.did";
import { useBalance } from "./BalanceContext";
import VioletButton from "./VioletButton";

interface ListingDetailsProps {
  principal: Principal | undefined;
  owner: Principal;
  intPropId: bigint;
  showRecommendation?: boolean;
  updateBipDetails: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  principal,
  owner,
  intPropId,
  showRecommendation,
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
          <div className="flex flex-row w-full items-center space-x-2 justify-between">
            <div className="text-lg font-bold">
              { getListedPrice() } bQC
            </div>
            <VioletButton isLoading={isLoading} onClick={() => triggerUnlist(intPropId)}>
              <span style={{ filter: 'grayscale(100%)' }}>Unlist 🏷️</span>
            </VioletButton>
          </div>
        );
      } else {
        // To list
        return (
          <div className="flex flex-col relative items-center w-full space-y-1 ">
            <div className="flex flex-row w-full items-center space-x-1 justify-between bg-violet-800 rounded-lg">
              <NumericFormat
                className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-white p-1.5 text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400 text-right ml-1"
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
              />
              <VioletButton isLoading={isLoading} onClick={() => triggerList(intPropId, sellPrice)}>
                List 🏷️
              </VioletButton>
            </div>
            {
              (showRecommendation === true) && (
              <div className="text-xs item-center absolute -bottom-4 whitespace-nowrap">
                Recommended price: 1 to 50 bQC
              </div>
              )
            }
          </div>
        );
      }
    }
  }

  // To buy
  return (
    <div className="flex flex-row space-x-2 w-full items-center justify-between">
      <div className="text-lg font-bold">
        { getListedPrice() } bQC
      </div>
      <VioletButton isLoading={isLoading} onClick={() => triggerBuy(intPropId)}>
        Buy 🛒
      </VioletButton>
    </div>
  );
};

export default ListingDetails;
