import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { Link, useParams } from "react-router-dom";
import { fromNullable } from "@dfinity/utils";

import { backendActor } from "../../actors/BackendActor";
import {
  formatDate,
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
  timeToDate,
} from "../../../utils/conversions";
import FilePreview from "../../common/FilePreview";
import ListingDetails from "../../common/ListingDetails";

// @ts-ignore
import { getName } from "country-list";
import BanIntProp from "../../common/BanIntProp";
import AirdropEligible from "../../common/AirdropEligible";
import UserNickName from "../../common/UserNickname";

import AiBot from "../../../assets/ai-bot.png";
import { HiCheckBadge } from "react-icons/hi2";
import { TbEye, TbHeart, TbTag } from "react-icons/tb";
import { IoIosPricetags, IoMdEye } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import fund from "../../../assets/fund.svg";
import UserImage from "../../common/UserImage";

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  
  const [owner, setOwner] = useState<Principal | undefined>(undefined);

  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

  const openCertificateInNewTab = () => {
    const certUrl = `/bip/${intPropId}/certificate`;
    window.open(certUrl, "_blank");
  };

  const { data: isBanned } = backendActor.useQueryCall({
    functionName: "is_banned_int_prop",
    args: [{ id: BigInt(intPropId) }],
  });

  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: BigInt(intPropId) }],
  });

  backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
    onSuccess(data) {
      console.log("Owner data:", data);
      setOwner(fromNullableExt(data));
    },
  });

  const extractRoyalties = (royalties: [] | [bigint]) : string => {
    let value = fromNullable(royalties);
    return value === undefined ? "None" : value === 0n ? "None" : Number(value) + "%";
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto font-semibold text-black dark:text-white">
      {/* <BipsHeader/> */}
      <div className="h-full w-full sm:p-8 md:p-4">
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-auto sm:rounded-xl">
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
            <div className="flex h-full flex-col items-center justify-center">
              <h1>❌ Error</h1>
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className="flex flex-col items-center justify-center text-xl font-bold">
                  IP Not Accessible
                </div>
                <div className="text-medium flex flex-col items-center justify-center">
                  This IP address is either unlisted or not in your ownership.
                  Only IP owners can view their assets in their bIP Wallet.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full max-h-[80dvh] w-full flex-col gap-[40px]">
              <div className="flex h-fit w-full flex-col items-start justify-between gap-[30px] lg:flex-row">
                <div className="flex w-full flex-col gap-[18px] lg:w-3/12 items-center">
                  <div className="h-auto w-full p-2">
                    <div className="mx-auto w-full rounded-[32px] shadow-[0px_0px_40px_-20px] shadow-primary md:w-fit">
                      {intProp.ok.V1.dataUri && (
                        <FilePreview
                          className="rounded-[32px]"
                          dataUri={intProp.ok.V1.dataUri}
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-[20px] items-center">
                    <p className="w-full flex flex-col text-center text-xl items-center">
                      {intProp.ok.V1.title}
                      {isBanned ? (
                        <div className="text-base text-red-500">
                          This IP has been banned ❌
                        </div>
                      ) : (
                        <AirdropEligible intPropId={BigInt(intPropId)} />
                      )}
                    </p>
                    <button
                      onClick={() => openCertificateInNewTab()}
                      className="flex w-full flex-row items-center justify-center gap-2 rounded-[10px] border border-primary bg-primary py-[6px] text-center text-[16px] uppercase text-white"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
                <div className="h-full w-full p-2 flex-col space-y-3 rounded-0 sm:rounded-[20px] bg-secondary/10 px-2 py-4 sm:p-6 dark:bg-white/10 md:p-6">
                  <div className="flex flex-col gap-[20px] rounded-[20px] px-[15px] py-[10px]">
                    <div className="flex flex-row items-center gap-[15px]">
                      <UserImage principal={intProp.ok.V1.author} />
                      <div className="flex flex-row items-center gap-1">
                        <UserNickName principal={intProp.ok.V1.author} />
                        <span>
                          <HiCheckBadge
                            size={24}
                            className="text-green-400"
                          />{" "}
                        </span>
                      </div>
                      <div className="ml-[10px]">
                        <button className="rounded-full border border-primary px-4 py-1 text-[14px]">
                          Follow
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between gap-[10px] md:flex-row md:items-center">
                      <div className="flex flex-col">
                        <p className="text-[26px]">BIP #{BigInt(intPropId).toString()}</p>
                        { owner && <p className="pb-1 text-xl">
                          Owned by @
                          <span className="text-primary">
                            <UserNickName principal={owner}/>
                          </span>{" "}
                        </p>
                        }
                      </div>
                      <div className="flex flex-row gap-6 ml-auto">
                        <div className="flex items-center gap-1">
                          <button className="flex size-[40px] items-center justify-center rounded-full bg-white/10">
                            {" "}
                            <TbHeart size={20} />{" "}
                          </button>
                          <p className="text-sm">31</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="flex size-[40px] items-center justify-center rounded-full bg-white/10">
                            {" "}
                            <IoEyeOutline size={20} />{" "}
                          </button>
                          <p className="text-sm">124</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-[20px] bg-white dark:bg-background-dark px-3 py-2">
                    <span
                      className="block max-h-[7.5em] overflow-auto whitespace-pre-line text-base leading-[1.5em] break-words text-justify"
                      style={{
                        display: "block",
                        maxHeight: "7.5em", // 5 lines * 1.5em line height
                        overflowY: "auto",
                        wordBreak: "break-word",
                      }}
                    >
                      {intProp.ok.V1.description}
                    </span>
                    {/* Put a horizontal light bar to separate the rest */}
                    <hr className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    <div className="flex h-full w-full sm:flex-row flex-col items-start justify-between gap-3 sm:gap-x-2">
                      <ul className="w-full space-y-1 text-xs text-gray-500 dark:text-gray-300">
                        <li className="grid grid-cols-2">
                          IP Type:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-100 text-right">
                            {intPropTypeToString(intProp.ok.V1.intPropType)}
                          </span>
                        </li>
                        <li className="grid grid-cols-2">
                          Licenses:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-100 text-right">
                            {intProp.ok.V1.intPropLicenses && intProp.ok.V1.intPropLicenses.length > 0
                              ? intProp.ok.V1.intPropLicenses.map(intPropLicenseToString).join(", ")
                              : "N/A"}
                          </span>
                        </li>
                        <li className="grid grid-cols-2">
                          Royalties:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-100 text-right">
                            { extractRoyalties(intProp.ok.V1.percentageRoyalties) }
                          </span>
                        </li>
                        <li className="grid grid-cols-2">
                          Creation Date:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-100 text-right">
                            {intProp.ok.V1.creationDate
                              ? formatDate(timeToDate(intProp.ok.V1.creationDate))
                              : "N/A"}
                          </span>
                        </li>
                        <li className="grid grid-cols-2">
                          Publication:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-100 text-right">
                            {intProp.ok.V1.publishing
                              ? (() => {
                                  const pub = fromNullable(intProp.ok.V1.publishing);
                                  if (!pub) return "N/A";
                                  const country = getName(pub.countryCode);
                                  const date = formatDate(timeToDate(pub.date));
                                  return `${date}, ${country}`;
                                })()
                              : "N/A"}
                          </span>
                        </li>
                      </ul>
                      <div className="flex flex-col space-y-2 mb-auto w-full">
                        {owner && (
                          <ListingDetails
                            principal={principal}
                            owner={owner}
                            intPropId={BigInt(intPropId)}
                          />
                        )}
                        <BanIntProp
                          principal={principal}
                          intPropId={BigInt(intPropId)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row gap-[10px] mt-2">
                      <img src={fund} alt="" />
                      <p className="mt-auto text-sm text-gray-400">
                        Supports creator This listing ensures the collection
                        creator receives their suggested earnings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BipDetails;
