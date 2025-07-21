import { Principal } from "@dfinity/principal";
import { NumericFormat } from "react-number-format";
import { useEffect, useState } from "react";
import Spinner from "../../assets/spinner.svg";

import { backendActor } from "../actors/BackendActor";
import { fromE8s, toE8s } from "../../utils/conversions";
import { TOKEN_DECIMALS_ALLOWED } from "../constants";
import { useBalance } from "./BalanceContext";
import VioletButton from "./VioletButton";
import { useAuth } from "@ic-reactor/react";
import { TbCheck, TbX } from "react-icons/tb";
import { IoIosPricetags } from "react-icons/io";
import { ModalPopup } from "./ModalPopup";
import { useListIntProp } from "../hooks/useListIntProp";
import { useUnlistIntProp } from "../hooks/useUnlistIntProp";
import { useBuyIntProp } from "../hooks/useBuyIntProp";
import { BiPencil } from "react-icons/bi";
import { useSearch } from "./SearchContext";

interface BuyButtonProps {
  principal: Principal | undefined;
  intPropId: bigint;
  e8sPrice: bigint;
  onSuccess?: () => void;
}

const BuyButton: React.FC<BuyButtonProps> = ({
  principal,
  intPropId,
  e8sPrice,
  onSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { login } = useAuth();
  const { refreshBalance } = useBalance();

  const { loading, call: buyIntProp } = useBuyIntProp({
    onSuccess: () => {
      setIsModalOpen(false);
      if (principal !== undefined) {
        refreshBalance([{ owner: principal, subaccount: [] }]);
      }
      onSuccess?.();
    },
  });

  return (
    <VioletButton
      type="buy"
      isLoading={loading}
      onClick={() => {
        principal === undefined || principal.isAnonymous()
          ? login()
          : setIsModalOpen(true);
      }}
    >
      <p className="text-lg font-semibold">{`${e8sPrice === 0n ? "Free" : "Buy"}`}</p>
      <ModalPopup
        onConfirm={() => {
          buyIntProp(intPropId);
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={loading}
      >
        <h2 className="text-xl font-bold text-black dark:text-white">
          {e8sPrice === 0n ? (
            <>Do you want to get this IP for free?</>
          ) : (
            <>{`Do you want to buy this IP for ${fromE8s(e8sPrice).toFixed(TOKEN_DECIMALS_ALLOWED)} BQC?`}</>
          )}
        </h2>
      </ModalPopup>
    </VioletButton>
  );
};

interface ListButtonProps {
  intPropId: bigint;
  onSuccess?: () => void;
  className?: string;
  modalLabel?: string;
  children?: React.ReactNode;
}

export const ListButton: React.FC<ListButtonProps> = ({
  intPropId,
  onSuccess,
  className,
  modalLabel,
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState<bigint>(0n);
  const { refreshDocuments } = useSearch();

  const { loading, call: listIntProp } = useListIntProp({
    onSuccess: () => {
      setIsModalOpen(false);
      setSellPrice(0n);
      refreshDocuments();
      onSuccess?.();
    },
  });

  return (
    <button
      className={
        className ??
        "flex w-full items-center justify-center rounded-lg bg-gradient-to-t from-primary to-secondary px-3 py-2 text-base"
      }
      disabled={loading}
      onClick={(e) => {
        e.preventDefault();
        setIsModalOpen(true);
      }}
    >
      {children ?? (
        <p
          className="flex flex-row gap-1 text-white"
          style={{ filter: "grayscale(100%)" }}
        >
          <TbCheck size={22} />
          <span>List</span>
        </p>
      )}
      <ModalPopup
        onConfirm={() => {
          listIntProp({ intPropId, sellPrice });
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={loading}
      >
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {modalLabel || "Do you want to List your IP?"}
          </h2>
          <NumericFormat
            className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 ml-1 block w-full rounded-lg border border-gray-300 bg-white p-1.5 text-right text-sm text-gray-900 dark:border-gray-500 dark:placeholder-gray-400"
            thousandSeparator=","
            decimalScale={TOKEN_DECIMALS_ALLOWED}
            value={Number(fromE8s(sellPrice))}
            onValueChange={(e) => {
              setSellPrice(
                toE8s(
                  parseFloat(e.value === "" ? "0" : e.value.replace(/,/g, "")),
                ),
              );
            }}
            suffix="BQC "
            spellCheck="false"
          />
        </div>
      </ModalPopup>
    </button>
  );
};

interface UnlistButtonProps {
  intPropId: bigint;
  onSuccess?: () => void;
}

const UnlistButton: React.FC<UnlistButtonProps> = ({
  intPropId,
  onSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refreshDocuments } = useSearch();

  const { loading, call: unlistIntProp } = useUnlistIntProp({
    onSuccess: () => {
      setIsModalOpen(false);
      refreshDocuments();
      onSuccess?.();
    },
  });

  return (
    <VioletButton
      type="unlist"
      isLoading={loading}
      onClick={() => setIsModalOpen(true)}
    >
      <p
        className="flex flex-row gap-1 text-white"
        style={{ filter: "grayscale(100%)" }}
      >
        {" "}
        <span>
          {" "}
          <TbX size={22} />
        </span>{" "}
        Unlist{" "}
      </p>
      <ModalPopup
        onConfirm={() => unlistIntProp(intPropId)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={loading}
      >
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Do you want to unlist your IP?
          </h2>
        </div>
      </ModalPopup>
    </VioletButton>
  );
};

interface ListingDetailsProps {
  principal: Principal | undefined;
  owner: Principal | undefined;
  intPropId: bigint;
  onListingChange?: (type: EListingType) => void;
}

export enum EListingType {
  LIST,
  UNLIST,
  BUY,
}

const ListingDetails: React.FC<ListingDetailsProps> = ({
  principal,
  owner,
  intPropId,
  onListingChange,
}) => {
  const [listingType, setListingType] = useState<EListingType | null>(null);
  const [e8sPrice, setE8sPrice] = useState<bigint | undefined>(undefined);

  const queryE8sPrice = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  const refreshListingType = () => {
    const isOwner = owner !== undefined && principal?.compareTo(owner) === "eq";

    queryE8sPrice
      .call()
      .then((result) => {
        if (result && "ok" in result) {
          setListingType(isOwner ? EListingType.UNLIST : EListingType.BUY);
          setE8sPrice(result.ok);
        } else {
          setListingType(isOwner ? EListingType.LIST : null);
          setE8sPrice(undefined);
        }
      })
      .catch((error) => {
        console.error("Error fetching e8s price:", error);
        setListingType(null);
        setE8sPrice(undefined);
      });
  };

  // Determine the listing type based on the current logged-in principal, owner of the IP and the price
  useEffect(() => {
    refreshListingType();
  }, [principal, owner, e8sPrice]);

  return listingType === null ? (
    <img
      src={Spinner}
      alt="Loading..."
      className="mx-auto h-8 w-8 animate-spin"
    />
  ) : (
    <div className="flex grid w-full grid-cols-2 items-center justify-center space-x-2 px-2 text-black dark:text-white">
      {e8sPrice !== undefined ? (
        <div className="flex flex-row items-center gap-1 text-base font-bold md:text-2xl">
          <span>
            <IoIosPricetags size={22} />
          </span>
          <span className="whitespace-nowrap">
            {fromE8s(e8sPrice).toFixed(TOKEN_DECIMALS_ALLOWED)} BQC
          </span>
          {listingType === EListingType.UNLIST && (
            <ListButton
              intPropId={intPropId}
              onSuccess={() => {
                refreshListingType();
              }}
              className="hover:text-gray-600 dark:hover:text-gray-400"
              modalLabel="Do you want to edit the IP price?"
            >
              <BiPencil size={22} />
            </ListButton>
          )}
        </div>
      ) : (
        <div>{/*spacer */}</div>
      )}

      {e8sPrice !== undefined && listingType === EListingType.BUY && (
        <BuyButton
          principal={principal}
          intPropId={intPropId}
          e8sPrice={e8sPrice}
          onSuccess={() => {
            onListingChange?.(EListingType.BUY);
            refreshListingType();
          }}
        />
      )}

      {listingType === EListingType.UNLIST && (
        <UnlistButton
          intPropId={intPropId}
          onSuccess={() => {
            onListingChange?.(EListingType.UNLIST);
            refreshListingType();
          }}
        />
      )}

      {listingType === EListingType.LIST && (
        <ListButton
          intPropId={intPropId}
          onSuccess={() => {
            onListingChange?.(EListingType.LIST);
            refreshListingType();
          }}
        />
      )}
    </div>
  );
};

export default ListingDetails;
