import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import {
  EQueryDirection,
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";
import ListingDetails from "../../common/ListingDetails";
import SpinnerSvg from "../../../assets/spinner.svg";
import { toNullable } from "@dfinity/utils";
import BipList from "../bips/BipList";
import { useEffect, useState } from "react";
import { IoGridOutline, IoListOutline } from "react-icons/io5";
import { TbEye } from "react-icons/tb";
import UserNickName from "../../common/UserNickname";
import AiBot from "../../../assets/ai-bot.png";
import ShareButton from "../../common/ShareButton";
import DeleteButton from "../../common/DeleteButton";

interface BIPDetailsProps {
  intPropId: bigint;
  principal: Principal;
}

const BIPDetails: React.FC<BIPDetailsProps> = ({
  intPropId,
  principal,
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
        />
      </div>
      <div className="col-span-1 flex w-fit flex-row items-center justify-center gap-2">
        <DeleteButton intPropId={intPropId} />
        <ShareButton intPropId={intPropId} />
      </div>
    </div>
  );
};

interface WalletProps {
  principal: Principal | undefined;
}

const take: [] | [bigint] = [BigInt(5)];

const Wallet = ({ principal }: WalletProps) => {
  const [selection, setSelection] = useState("owned");
  const [isGrid, setIsGrid] = useState(true);

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

  const [triggered, setTriggered] = useState(true);

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
          triggered={triggered}
        />
      </div>
    </div>
  );
};

export default Wallet;
