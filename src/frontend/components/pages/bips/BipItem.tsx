import { useState } from "react";
import { Link } from "react-router-dom";

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
import { TbCheck, TbCross, TbEye, TbPencil, TbShare, TbTrash, TbX } from "react-icons/tb";

interface BipItemProps {
  principal: Principal | undefined;
  intPropId: bigint;
}

const BipItem: React.FC<BipItemProps> = ({ intPropId, principal }) => {
  const [owner, setOwner] = useState<Principal | undefined>(undefined);

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
        <Link
          className="min-h-[450px] w-[400px] rounded-2xl border-2 border-black/50 dark:border-white/50 bg-white dark:bg-white/10 backdrop-blur-[10px]"
          to={`/bip/${intPropId}`}
        >
          <div className="flex h-full flex-col gap-y-1 p-2 text-base text-white">
            {intProp.ok.V1.dataUri ? (
              <div className="relative w-full rounded-lg">
                <FilePreview
                  dataUri={intProp.ok.V1.dataUri}
                  className="flex h-[260px] w-[390px] flex-col items-center justify-center rounded-2xl object-cover"
                />
                <div className="absolute right-0 top-0 flex h-[60px] w-[100px] items-center justify-center rounded-bl-3xl rounded-tr-lg bg-neutral-600/40 backdrop-blur-md">
                  <p className="flex flex-row items-center gap-1 text-sm">
                    <TbEye size={18} /> 326
                  </p>
                </div>
                <div className="absolute bottom-5 right-0 flex h-[75px] w-[40px] flex-col justify-between">
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-600/40 backdrop-blur-md">
                    {" "}
                    <TbTrash size={24} />{" "}
                  </div>
                  <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-600/40 backdrop-blur-md">
                    {" "}
                    <TbShare size={24} />{" "}
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={AIBotImg}
                className="h-[260px] w-[390px] rounded-lg border border-gray-300 object-cover shadow-md"
                alt="Logo"
              />
            )}
            <div className="flex h-full flex-col justify-between pt-3">
              <div className="flex flex-row items-start justify-between">
                <div className="flex w-8/12 flex-row gap-2">
                  <div className="h-[40px] w-[40px] rounded-full bg-blue-500 overflow-hidden">
                    <img src={(intProp.ok.V1.dataUri)} alt="" />
                  </div>
                  <div className="w-fit">
                    <div className="pb-1">
                      <p className="text-2xl leading-none text-black dark:text-white">
                        {intProp.ok.V1.title}
                      </p>
                      <p className="text-xs text-black dark:text-white">By @ User Name</p>
                    </div>
                    <div className="w-fit pt-2">
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
                <div className="flex w-4/12 flex-row items-center gap-1 text-black dark:text-white">
                  <IoIosPricetags size={22} />
                  <p className="text-nowrap text-[22px] ">10.00 bQC</p>
                </div>
              </div>
              <div className="mx-auto flex w-fit flex-row items-center gap-8 pb-2 pt-4">
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
              </div>
            </div>
            {/* <div className="grid grid-cols-6 border">
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
              <p className="truncate font-semibold text-base border">
                Licenses: {intProp.ok.V1.intPropLicenses
                  .map(intPropLicenseToString)
                  .join(", ")}
              </p>
            )} */}
            {/* Use `flex-grow` to push the last child to the bottom */}
            {/* <div className="flex-grow"></div> */}
            {/* <div className="border">
              {owner && (
                <ListingDetails
                  principal={principal}
                  owner={owner}
                  intPropId={intPropId}
                  updateBipDetails={() => {}}
                />
              )}
            </div> */}
          </div>
        </Link>
      )}
    </>
  );
};

export default BipItem;
