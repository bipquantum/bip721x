import { useNavigate } from "react-router-dom";
import { backendActor } from "./actors/BackendActor";
import { toast } from "react-toastify";
import { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { NumericFormat } from "react-number-format";
import { fromE8s, toE8s } from "../utils/conversions";
import { useState } from "react";

interface ListingDetailsProps {
  principal: Principal | undefined;
  intPropId: bigint;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  principal,
  intPropId,
}) => {
  const navigate = useNavigate();

  const [sellPrice, setSellPrice] = useState<bigint>(BigInt(0));

  const { data: owners } = backendActor.useQueryCall({
    functionName: "owners_of",
    args: [{ token_ids: [intPropId] }],
  });

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const { call: listIntProp } = backendActor.useUpdateCall({
    functionName: "list_int_prop",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
  });

  const getOwner = (): Principal | undefined =>
    owners?.length === 1 ? fromNullable(owners[0])?.[0] : undefined;

  const getListedPrice = () =>
    !e8sPrice ? undefined : "ok" in e8sPrice ? e8sPrice.ok : null;

  const triggerBuy = (intPropId: bigint) => {
    buyIntProp([{ token_id: intPropId }]).then((result) => {
      if (!result) {
        toast.warn("Failed to buy: undefined error");
      } else {
        if ("ok" in result) {
          toast.success("Success");
          navigate(`/bip/${intPropId.toString()}`);
        } else {
          toast.warn("Failed to buy");
        }
      }
    });
  };

  const triggerList = (intPropId: bigint, sellPrice: bigint) => {
    listIntProp([{ token_id: intPropId, e8s_icp_price: sellPrice }]).then(
      (result) => {
        if (!result) {
          toast.warn("Failed to list: undefined error");
        } else {
          if ("ok" in result) {
            toast.success("Success");
            navigate(`/bip/${intPropId.toString()}`);
          } else {
            toast.warn("Failed to list");
          }
        }
      },
    );
  };

  const triggerUnlist = (intPropId: bigint) => {
    unlistIntProp([{ token_id: intPropId }]).then((result) => {
      if (!result) {
        toast.warn("Failed to unlist: undefined error");
      } else {
        if ("ok" in result) {
          toast.success("Success");
          navigate(`/bip/${intPropId.toString()}`);
        } else {
          toast.warn("Failed to unlist");
        }
      }
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

  if (getOwner() === undefined) {
    return (
      <div>
        <h1>Error</h1>
        <p>{"Cannot find IP's owner"}</p>
      </div>
    );
  }

  if (principal !== undefined) {
    if (getOwner()?.compareTo(principal) == "eq") {
      if (getListedPrice()) {
        return (
          <div>
            <button
              onClick={() => triggerUnlist(intPropId)}
              className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              Unlist
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row">
            <label
              htmlFor="e8sIcpPrice"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              List for (ICP)
            </label>
            <NumericFormat
              className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
              thousandSeparator=","
              decimalScale={2}
              value={Number(fromE8s(sellPrice))}
              onValueChange={(e) => {
                setSellPrice(toE8s(parseFloat(e.value.replace(/,/g, ""))));
              }}
            />
            <button
              onClick={() => triggerList(intPropId, sellPrice)}
              className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              List
            </button>
          </div>
        );
      }
    }
  }

  const price = getListedPrice();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="text-lg font-bold text-blue-600">
        ICP {price ? fromE8s(price).toFixed(2) : "N/A"}
      </div>
      <button
        onClick={() => triggerBuy(intPropId)}
        className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Buy
      </button>
    </div>
  );
};

export default ListingDetails;
