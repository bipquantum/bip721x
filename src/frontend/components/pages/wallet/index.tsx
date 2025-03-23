import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import {
  EQueryDirection,
  formatDate,
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
  timeToDate,
} from "../../../utils/conversions";
import CertificateButton from "../bips/CertificateButton";
import ListingDetails from "../../common/ListingDetails";
import SpinnerSvg from "../../../assets/spinner.svg";
import { Link } from "react-router-dom";
import { toNullable } from "@dfinity/utils";
import BipList from "../bips/BipList";
import { useEffect, useState } from "react";
import { IoGridOutline, IoListOutline } from "react-icons/io5";
import FilePreview from "../../common/FilePreview";
import {
  TbCheck,
  TbEye,
  TbPencil,
  TbShare,
  TbTrash,
  TbX,
} from "react-icons/tb";
import UserNickName from "../../common/UserNickname";
import AiBot from "../../../assets/ai-bot.png";

import { ModalPopup } from "../../common/ModalPopup";
import { NumericFormat } from "react-number-format";
import { TOKEN_DECIMALS_ALLOWED } from "../../constants";
import { dateToTime, fromE8s, toE8s } from "../../../utils/conversions";
import { bip721LedgerActor } from "../../actors/Bip721LedgerActor";
import Login from "../login";
import {
  ApprovalInfo,
  RevokeTokenApprovalArg,
} from "../../../../declarations/bip721_ledger/bip721_ledger.did";
import { canisterId } from "../../../../declarations/backend";
import { toast } from "react-toastify";

interface BIPDetailsProps {
  intPropId: bigint;
  principal: Principal;
  handleListClick: (bipId: bigint) => void;
  handleUnlistClick: (bipId: bigint) => void;
}

const BIPDetails: React.FC<BIPDetailsProps> = ({
  intPropId,
  principal,
  handleListClick,
  handleUnlistClick,
}) => {
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });
  const [owner, setOwner] = useState<Principal | undefined>(undefined);

  const {} = backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
    onSuccess(data) {
      setOwner(fromNullableExt(data));
    },
  });

  if (intProp === undefined || "ok" in intProp === false) {
    return <img src={SpinnerSvg} alt="Loading..." />;
  }

  return (
    <div className="grid grid-cols-2 justify-items-center gap-[10px] rounded-2xl bg-white px-2 py-2 dark:bg-white/10 lg:grid-cols-3 xl:grid-cols-6">
      <div className="col-span-1 h-[110px] w-[110px] overflow-hidden rounded-lg border-2 border-black/20 dark:border-white/20">
        <img
          src={intProp.ok.V1.dataUri}
          className="h-full w-full items-center object-cover"
        />
      </div>
      <div className="col-span-1 flex w-fit flex-row items-center justify-center gap-2">
        <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-blue-500">
          <img src={AiBot} alt="" className="h-[40px] w-[40px] rounded-full" />
        </div>
        <div className="w-fit">
          <div className="flex flex-col gap-3 text-black dark:text-white">
            <p className="text-xl leading-none">{intProp.ok.V1.title}</p>
            <p className="text-xs">
              by @ {<UserNickName principal={intProp.ok.V1.author} />}
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-1 flex w-fit flex-col items-start justify-center">
        <p className="text-sm text-neutral-400">
          Type:{" "}
          <span className="text-sm text-neutral-400">
            {intPropTypeToString(intProp.ok.V1.intPropType)}
          </span>
        </p>
        <p className="text-sm text-neutral-400">
          Licenses:{" "}
          <span className="text-sm text-neutral-400">
            {intProp.ok.V1.intPropLicenses
              .map(intPropLicenseToString)
              .join(", ")}
          </span>
        </p>
      </div>
      <div className="col-span-1 flex w-fit items-center justify-center">
        <div className="flex h-fit w-fit items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md">
          <p className="flex flex-row items-center gap-1 text-sm text-white">
            <TbEye size={18} /> 325
          </p>
        </div>
      </div>
      <div className="col-span-1 mr-8 flex h-full w-full items-center lg:m-0">
        <ListingDetails
          principal={principal}
          owner={principal}
          intPropId={intPropId}
          updateBipDetails={() => {}}
          handleListClick={handleListClick}
          handleUnlistClick={handleUnlistClick}
        />
      </div>
      <div className="col-span-1 flex w-fit flex-row items-center justify-center gap-2">
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-500/40 text-white backdrop-blur-md">
          {" "}
          <TbTrash size={24} />{" "}
        </div>
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-500/40 text-white backdrop-blur-md">
          {" "}
          <TbShare size={24} />{" "}
        </div>
      </div>
    </div>
  );
};

interface WalletProps {
  principal: Principal | undefined;
}

const take: [] | [bigint] = [BigInt(5)];

const Wallet = ({ principal }: WalletProps) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedBipId, setSelectedBipId] = useState<bigint>(BigInt(0));
  const [isUnlistModalOpen, setIsUnlistModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState("owned");
  const [isGrid, setIsGrid] = useState(true);
  const [sellPrice, setSellPrice] = useState<bigint>(BigInt(0));

  if (principal === undefined) {
    console.error("Principal is undefined");
    return <img src={SpinnerSvg} alt="Loading..." />;
  }

  const { call: getIntPropsOf } = backendActor.useQueryCall({
    functionName: "get_int_props_of",
  });

  const fetchBips = async (prev: bigint | undefined) => {
    return await getIntPropsOf([
      { owner: principal, prev: toNullable(prev), take },
    ]);
  };
  const [queryDirection, setQueryDirection] = useState<EQueryDirection>(
    EQueryDirection.Forward,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsGrid(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleListClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsListModalOpen(true);
  };

  const handleUnlistClick = (bipId: bigint) => {
    setSelectedBipId(bipId);
    setIsUnlistModalOpen(true);
  };

  const { call: revokeBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_revoke_token_approvals",
  });

  const { call: approveBip721Transfer } = bip721LedgerActor.useUpdateCall({
    functionName: "icrc37_approve_tokens",
  });

  const { call: listIntProp } = backendActor.useUpdateCall({
    functionName: "list_int_prop",
  });

  const { call: unlistIntProp } = backendActor.useUpdateCall({
    functionName: "unlist_int_prop",
  });

  const [triggered, setTriggered] = useState(true);
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
                setTriggered(!triggered);
                // TODO : Find a way to integrate this here and on bips component
                // getE8sPrice().finally(() => {
                //   const details = updateBipDetails();
                // });
                setIsListModalOpen(false);
              }
            },
          );
        }
      })
      .catch((e: any) => {
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
              setTriggered(!triggered);

              // getE8sPrice().finally(() => {
              //   updateBipDetails();
              // });
              setIsUnlistModalOpen(false);
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

  return (
    <div className="flex h-auto w-full flex-col items-center overflow-y-auto px-4 py-[15px] text-black dark:text-white">
      <div className="flex w-full flex-row items-center justify-between px-4 pb-6">
        {isGrid ? (
          <p className="font-momentum text-xl font-extrabold text-black dark:text-white">
            Recently Bought
          </p>
        ) : (
          <div className="flex w-fit flex-row items-center">
            <button
              onClick={() => {
                setSelection("owned");
              }}
              className={`font-momentum rounded-xl px-4 py-2 text-xl font-extrabold text-black dark:text-white ${selection === "owned" ? "bg-black/10 dark:bg-white/20" : "bg-transparent"}`}
            >
              Recently Bought / Created
            </button>
            <button
              onClick={() => {
                setSelection("created");
              }}
              className={`font-momentum rounded-xl px-4 py-2 text-xl font-extrabold text-black dark:text-white ${selection === "created" ? "bg-black/10 dark:bg-white/20" : "bg-transparent"}`}
            >
              Recently Created
            </button>
          </div>
        )}

        <div
          onClick={() => setIsGrid(!isGrid)}
          className="hidden w-fit flex-row items-center justify-between gap-2 rounded-2xl bg-black/10 px-2 py-[6px] text-white backdrop-blur-[10px] dark:bg-white/20 lg:flex"
        >
          <button
            className={`rounded-lg p-2 ${isGrid ? "bg-white text-black" : ""}`}
          >
            <IoGridOutline size={28} />
          </button>
          <button
            className={`rounded-lg p-2 ${!isGrid ? "bg-white text-black" : ""}`}
          >
            <IoListOutline size={28} />
          </button>
        </div>
      </div>
      <div className="pb-[80px]">
        <BipList
          scrollableClassName={"flex flex-col w-full gap-[10px]"}
          principal={principal}
          fetchBips={fetchBips}
          queryDirection={queryDirection}
          isGrid={isGrid}
          BipItemComponent={BIPDetails}
          handleListClick={handleListClick}
          handleUnlistClick={handleUnlistClick}
          triggered={triggered}
        />
      </div>

      <ModalPopup
        onConfirm={() => {
          triggerList(selectedBipId, sellPrice);
        }}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      >
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Do you want to List your IP?
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
            suffix="bQC "
            spellCheck="false"
          />
        </div>
      </ModalPopup>
      <ModalPopup
        onConfirm={() => {
          triggerUnlist(selectedBipId);
        }}
        isOpen={isUnlistModalOpen}
        onClose={() => setIsUnlistModalOpen(false)}
      >
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Do you want to UnList your IP?
          </h2>
        </div>
      </ModalPopup>
    </div>
  );
};

export default Wallet;
