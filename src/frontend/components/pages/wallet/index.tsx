import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import {
  formatDate,
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
import { useState } from "react";
import { IoGridOutline, IoListOutline } from "react-icons/io5";
import FilePreview from "../../common/FilePreview";
import { TbCheck, TbEye, TbPencil, TbShare, TbTrash, TbX } from "react-icons/tb";

interface BIPDetailsProps {
  intPropId: bigint;
  principal: Principal;
}

const BIPDetail: React.FC<BIPDetailsProps> = ({ intPropId, principal }) => {
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  if (intProp === undefined || "ok" in intProp === false) {
    return <img src={SpinnerSvg} alt="Loading..." />;
  }

  return (
    // <div className="grid sm:grid-cols-3 md:grid-cols-9 gap-2 sm:p-8 shadow border-2 border-tertiary hover:border-primary bg-tertiary sm:rounded-lg text-white mx-3 my-1 items-center rounded-lg p-2">
    //   <Link className="col-span-2 text-xl" to={`/bip/${intPropId.toString()}`}>{intProp.ok.V1.title}</Link>
    //   <Link className="col-span-1"  to={`/bip/${intPropId.toString()}`}>{formatDate(timeToDate(intProp.ok.V1.creationDate))}</Link>
    //   <div className="col-span-3">
    //     <ListingDetails principal={principal} owner={principal} intPropId={intPropId} updateBipDetails={() => {}} />
    //   </div>
    //   <div className="col-span-3 justify-self-end">
    //     <CertificateButton intPropId={intPropId.toString()} intProp={intProp.ok.V1}/>
    //   </div>
    // </div>

    <div className="grid grid-cols-6 gap-[10px] rounded-2xl bg-white dark:bg-white/10 px-2 py-2">
      <div className="col-span-1 h-fit w-[110px]">
        <FilePreview
          dataUri={intProp.ok.V1.dataUri}
          className={"h-fit rounded-lg"}
        />
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-blue-500">
          <img src={(intProp.ok.V1.dataUri)} alt="" className="h-[40px] w-[40px] rounded-full" />
        </div>
        <div className="w-fit">
          <div className="flex flex-col gap-3 text-black dark:text-white">
            <p className="text-xl leading-none">{intProp.ok.V1.title}</p>
            <p className="text-xs">by @ User Name</p>
          </div>
        </div>
      </div>
      <div className="flex w-fit flex-col items-start justify-center">
        <p className="text-sm text-neutral-400">
          Type:{" "}
          <span className="text-sm text-neutral-400">
            {intPropTypeToString(intProp.ok.V1.intPropType)}
          </span>
        </p>
        <p className="text-sm text-neutral-400">
          License:{" "}
          <span className="text-sm text-neutral-400">
            {intProp.ok.V1.intPropLicenses
              .map(intPropLicenseToString)
              .join(", ")}
          </span>
        </p>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex h-fit w-fit items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md">
          <p className="flex flex-row items-center gap-1 text-sm text-white">
            <TbEye size={18} /> 325
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        {/* Handle logic for listed and unlisted IPs */}
        {(intProp.ok.V1.author) ? (
          <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] bg-gradient-to-t from-primary to-secondary py-2 font-semibold uppercase text-white">
            {" "}
            <TbCheck size={22} /> List{" "}
          </button>
        ) : (
          <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] bg-gradient-to-t from-red-500 to-red-400 py-2 font-semibold uppercase text-white">
            {" "}
            <TbX size={22} /> Unlist{" "}
          </button>
        )}
        <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border-2 py-2 font-semibold">
          {" "}
          <TbPencil size={18} /> Edit{" "}
        </button>
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
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

  const [selection, setSelection] = useState("owned");
  const [isGrid, setIsGrid] = useState(true);

  return (
    <div className="flex max-h-[85vh] w-full flex-col items-center overflow-y-auto px-4 py-[15px] text-black dark:text-white">
      <div className="flex w-full flex-row items-center justify-between px-4 py-6">
        <div className="flex w-fit flex-row items-center">
          <button
            onClick={() => {
              setSelection("owned");
            }}
            className={`rounded-xl px-4 py-2 text-xl font-momentum font-extrabold text-black dark:text-white ${selection === "owned" ? "bg-black/10 dark:bg-white/20" : "bg-transparent"}`}
          >
            Recently Bought
          </button>
          <button
            onClick={() => {
              setSelection("created");
            }}
            className={`rounded-xl px-4 py-2 text-xl font-momentum font-extrabold text-black dark:text-white ${selection === "created" ? "bg-black/10 dark:bg-white/20" : "bg-transparent"}`}
          >
            Recently Created
          </button>
        </div>
        <div
          onClick={() => setIsGrid(!isGrid)}
          className="flex w-fit flex-row items-center justify-between gap-2 rounded-2xl bg-black/10 px-2 py-[6px] text-white backdrop-blur-[10px] dark:bg-white/20"
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
      <BipList
        principal={principal}
        isGrid={isGrid}
        fetchBips={fetchBips}
        BipItemComponent={BIPDetail}
        scrollableClassName={"flex flex-col w-full gap-[10px]"}
      />
    </div>
  );
};

export default Wallet;
