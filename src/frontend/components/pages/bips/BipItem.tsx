import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor";
import {
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";
import FilePreview from "../../common/FilePreview";

import AIBotImg from "../../../assets/ai-bot.png";
import { Principal } from "@dfinity/principal";
import ListingDetails from "../../common/ListingDetails";
import AirdropEligible from "../../common/AirdropEligible";

import { IoIosPricetags } from "react-icons/io";
import {
  TbCheck,
  TbCross,
  TbEye,
  TbPencil,
  TbShare,
  TbTrash,
  TbX,
} from "react-icons/tb";

interface BipItemProps {
  principal: Principal | undefined;
  intPropId: bigint;
  onListClick: (bipId: bigint) => void;
  onUnlistingClick: (bipId: bigint) => void;
  onEditingClick: (bipId: bigint) => void;
}

const BipItem: React.FC<BipItemProps> = ({
  intPropId,
  principal,
  onListClick,
  onUnlistingClick,
  onEditingClick,
}) => {
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const [itemPrice, setitemPrice] = useState<string>("");
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  const {} = backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
    onSuccess(data) {
      setOwner(fromNullableExt(data));
    },
  });

  const location = useLocation();
  console.log("location :", location);
  return (
    <>
      {intProp === undefined ? (
        <div
          className="text-center text-white"
          style={{
            padding: "100px",
          }}
        >
          Loading...
        </div>
      ) : "err" in intProp ? (
        <div>
          <h1>❌ Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <div
          className="col-span-1 h-fit w-full rounded-2xl border-2 border-black/50 bg-white backdrop-blur-[10px] dark:border-white/50 dark:bg-white/10"
          // to={`/bip/${intPropId}`}
        >
          <div className="flex h-full flex-col gap-y-1 p-2 text-sm text-white lg:text-base">
            <Link
              to={`/bip/${intPropId}`}
              className="relative w-full rounded-lg"
            >
              {intProp.ok.V1.dataUri ? (
                <FilePreview
                  dataUri={intProp.ok.V1.dataUri}
                  className="flex h-[260px] w-full flex-col items-center justify-center rounded-2xl object-cover"
                />
              ) : (
                <img
                  src={AIBotImg}
                  className="h-[260px] w-full rounded-lg border border-gray-300 object-cover shadow-md"
                  alt="Logo"
                />
              )}
              <div className="absolute right-0 top-0 flex h-[40px] w-[60px] items-center justify-center rounded-bl-3xl rounded-tr-lg bg-neutral-500/20 backdrop-blur-sm md:h-[60px] md:w-[80px] lg:h-[60px] lg:w-[100px]">
                <div>
                  <p className="flex cursor-pointer flex-row items-center gap-1 text-sm">
                    <TbEye size={18} /> 326
                  </p>
                </div>
              </div>
              <div className="absolute bottom-5 right-0 flex h-[75px] w-[40px] flex-col justify-between">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-500/20 backdrop-blur-sm">
                  {" "}
                  <TbTrash size={24} />{" "}
                </div>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-500/20 backdrop-blur-sm">
                  {" "}
                  <TbShare size={24} />{" "}
                </div>
              </div>
            </Link>

            <div className="flex h-full flex-col justify-between pt-3">
              <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:gap-0">
                <div
                  className={`flex ${location.pathname === "/marketplace" ? "w-full" : "w-full md:w-8/12"} flex-row gap-2`}
                >
                  <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-blue-500">
                    <img src={intProp.ok.V1.dataUri} alt="" />
                  </div>
                  <div
                    className={`${location.pathname === "/marketplace" ? "flex w-full flex-row items-center justify-between" : "flex w-fit flex-col"}`}
                  >
                    <div className="pb-1">
                      <p className="text-2xl leading-none text-black dark:text-white">
                        {intProp.ok.V1.title}
                      </p>
                      <p className="text-xs text-black dark:text-white">
                        By @ User Name
                      </p>
                    </div>
                    <div className="w-fit pt-1">
                      <p className="text-sm font-light text-neutral-400">
                        Type:{" "}
                        <span className="text-sm font-light text-neutral-400">
                          {intPropTypeToString(intProp.ok.V1.intPropType)}
                        </span>
                      </p>
                      <p className="text-sm font-light text-neutral-400">
                        License:{" "}
                        <span className="text-sm font-light text-neutral-400">
                          {intProp.ok.V1.intPropLicenses
                            .map(intPropLicenseToString)
                            .join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {location.pathname !== "/marketplace" && itemPrice && (
                  <div className="flex w-4/12 flex-row items-center gap-1 p-1 text-black dark:text-white">
                    <IoIosPricetags size={22} />
                    <p className="text-nowrap text-[22px]">{itemPrice} bQC</p>
                  </div>
                )}
              </div>
              {/* <div className="mx-auto flex w-fit flex-row items-center gap-8 pb-2 pt-4">
                {intProp.ok.V1.title ? (
                  <button className="uppercase flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] bg-gradient-to-t from-primary to-secondary py-2 font-semibold">
                    {" "}
                    <TbCheck size={22} /> List{" "}
                  </button>
                ): (
                  <button className="uppercase flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] bg-gradient-to-t from-red-500 to-red-400 py-2 font-semibold">
                    {" "}
                    <TbX size={22} /> Unlist{" "}
                  </button>
                )}
                <button className="uppercase flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border py-2 font-semibold text-black dark:text-white border-black dark:border-white">
                  {" "}
                  <TbPencil size={22} /> Edit{" "}
                </button>
              </div> */}
            </div>
            {/* <div className="grid grid-cols-6">
              <p className="truncate text-2xl font-semibold col-span-5">
                {intProp.ok.V1.title}
              </p>
              <div className="justify-self-end">
                <AirdropEligible intPropId={intPropId} compact={true} />
              </div>
            </div>
            <p className="truncate font-semibold text-base">
              Type: {intPropTypeToString(intProp.ok.V1.intPropType)}
            </p>
            {intProp.ok.V1.intPropLicenses.length > 0 && (
              <p className="truncate font-semibold text-base">
                Licenses: {intProp.ok.V1.intPropLicenses
                  .map(intPropLicenseToString)
                  .join(", ")}
              </p>
            )} */}

            {/* Use `flex-grow` to push the last child to the bottom */}
            <div className="flex-grow"></div>
            <div className="py-2">
              {owner && (
                <ListingDetails
                  setItemPrice={setitemPrice}
                  principal={principal}
                  owner={owner}
                  intPropId={intPropId}
                  updateBipDetails={() => {}}
                  onListClick={() => onListClick(intPropId)}
                  onUnlistingClick={() => onUnlistingClick(intPropId)}
                  onEditingClick={() => onEditingClick(intPropId)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BipItem;
