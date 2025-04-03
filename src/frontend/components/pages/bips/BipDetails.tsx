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
import UserDetails from "../../common/UserDetails";
import ListingDetails from "../../common/ListingDetails";

import BipsHeader from "./BipsHeader";
import CertificateButton from "./CertificateButton";
import { IntProp } from "../../../../declarations/backend/backend.did";

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
import CountdownTimer from "../../common/CountdownTimer";
import BipList from "./BipList";
import fund from "../../../assets/fund.svg";

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

  const openCertificateInNewTab = () => {
    const certUrl = `/bip/${intPropId}/certificate`;
    window.open(certUrl, "_blank");
  };

  const { data: isBanned, call: getIsBanned } = backendActor.useQueryCall({
    functionName: "is_banned_int_prop",
    args: [{ id: BigInt(intPropId) }],
  });

  const { data: intProp, call: getIntProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: BigInt(intPropId) }],
  });

  const { call: getOptOwner } = backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
    onSuccess(data) {
      setOwner(fromNullableExt(data));
    },
  });

  const updateBipDetails = () => {
    getIntProp();
    getOptOwner();
    getIsBanned();
  };

  const getPublishingDate = (ip: IntProp) => {
    const publish = fromNullable(ip.publishing);

    if (publish !== undefined) {
      return formatDate(timeToDate(publish.date));
    }

    return "N/A";
  };

  const bid = true;

  const dummyData = {
    "Live Auction": [
      {
        id: 1,
        title: "Monkey Ape",
        user: "@JSmith",
        image: AiBot,
        views: 211,
        price: "10.00 BQC",
        type: "Copyright",
        license: "SaaS",
        auction: true,
      },
      {
        id: 2,
        title: "Monkey Ape",
        user: "@JSmith",
        image: AiBot,
        views: 211,
        price: "10.00 BQC",
        type: "Copyright",
        license: "SaaS",
        listed: true,
      },
    ],
  };

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
                <div className="flex w-full flex-col gap-[18px] lg:w-3/12">
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
                  <div className="flex flex-col gap-[20px]">
                    <p className="w-full text-center text-xl">
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
                      className="flex w-full flex-row items-center justify-center gap-2 rounded-[10px] border border-primary py-[6px] text-center text-[16px] uppercase text-black dark:text-white"
                    >
                      Generate Certificate
                    </button>
                    <button
                      onClick={() => openCertificateInNewTab()}
                      className="flex w-full flex-row items-center justify-center gap-2 rounded-[10px] border border-primary bg-primary py-[6px] text-center text-[16px] uppercase text-white"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
                <div className="h-full w-full p-2 lg:w-9/12">
                  <div className="flex h-full flex-col gap-[15px] rounded-[40px] bg-secondary/10 p-[20px] dark:bg-white/10 md:p-[30px]">
                    <div className="flex h-fit flex-col gap-[20px]">
                      <div className="flex flex-row items-center gap-[15px]">
                        <div className="size-[40px] overflow-hidden rounded-full">
                          <img src={AiBot} alt="" />
                        </div>
                        <div className="flex flex-row items-center gap-1">
                          <p>UserName</p>
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
                      <div className="flex flex-col-reverse justify-between gap-[10px] md:flex-row md:items-center">
                        <div>
                          <p className="text-[26px]">Elemental #6173</p>
                          <p className="pb-1 text-xl">
                            Owned by @
                            <span className="text-primary">
                              <UserNickName principal={intProp.ok.V1.author} />
                            </span>{" "}
                          </p>
                        </div>
                        <div className="flex flex-row gap-6">
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
                    <div className="flex h-full flex-col gap-[20px] rounded-[20px] bg-white dark:bg-background-dark">
                      <div className="flex flex-row border-b border-black/50 px-[30px] py-[10px] dark:border-white/10">
                        <div className="flex h-full w-full flex-col items-center justify-between gap-2 py-2 md:flex-row">
                          <p>Sale ends December 24, 2024 at 6:29 AM</p>
                          <CountdownTimer hours={0} minutes={52} seconds={0} />
                        </div>
                      </div>
                      <div className="flex flex-col px-[15px] py-[10px] md:px-[30px]">
                        <div className="flex h-full w-full flex-col items-start justify-between gap-3 py-2 md:gap-0">
                          <div className="flex flex-col gap-2 md:flex-col">
                            <p className="flex flex-row items-center gap-2 text-sm text-gray-400 md:text-base">
                              <span className="text-gray-400">
                                <TbTag size={20} />
                              </span>{" "}
                              Current Price
                            </p>
                          </div>
                          <div className="mt-auto w-full">
                            {owner && (
                              <ListingDetails
                                principal={principal}
                                owner={owner}
                                intPropId={BigInt(intPropId)}
                                updateBipDetails={updateBipDetails}
                                showRecommendation={true}
                              />
                            )}
                          </div>
                        </div>
                        <BanIntProp
                          principal={principal}
                          intPropId={BigInt(intPropId)}
                        />
                        <div className="flex flex-row gap-[10px]">
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
              </div>
              <div className="flex flex-col gap-[10px] p-[10px] md:px-0">
                <p className="font-momentum text-xl font-extrabold uppercase text-black dark:text-white">
                  Recommendations
                </p>
                {Object.entries(dummyData).map(([category, items]) => (
                  <div className="grid w-full gap-[20px] lg:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        className="min-h-[350px] w-[300px] rounded-2xl border-2 border-white/50 bg-white/10 backdrop-blur-[10px] md:min-h-[450px] md:w-[400px]"
                        to={`/bip/${item.id}`}
                      >
                        <div className="flex h-full flex-col gap-y-1 p-2 text-base text-white">
                          <div className="relative h-[260px] w-full rounded-lg">
                            <img
                              src={item.image}
                              alt=""
                              className="flex h-[260px] w-[390px] flex-col items-center justify-center overflow-hidden rounded-2xl object-cover"
                            />
                            <div className="absolute right-0 top-0 flex h-[60px] w-[100px] items-center justify-center rounded-bl-3xl rounded-tr-lg bg-neutral-600/40 backdrop-blur-md">
                              <p className="flex flex-row items-center gap-1 text-sm">
                                <TbEye size={18} /> {item.views}
                              </p>
                            </div>
                          </div>
                          <div className="flex h-full flex-col justify-between pt-3">
                            <div className="flex flex-row items-start justify-between">
                              <div className="flex w-full flex-row gap-2">
                                <div className="h-[40px] w-[40px] overflow-hidden rounded-full bg-blue-500">
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="flex w-full flex-row items-center justify-between">
                                  <div>
                                    <p className="text-2xl leading-none">
                                      {item.title}
                                    </p>
                                    <p className="text-xs">By {item.user}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-light text-neutral-400">
                                      Type: {item.type}
                                    </p>
                                    <p className="text-sm font-light text-neutral-400">
                                      License: {item.license}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex w-full flex-row items-center justify-between gap-8 px-2 pb-2 pt-4">
                              <div className="flex flex-row items-center gap-1 text-white">
                                <IoIosPricetags size={22} />
                                <p className="text-nowrap text-[22px]">
                                  {item.price}
                                </p>
                              </div>
                              {!item.auction ? (
                                <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border-2 border-primary py-2 font-semibold uppercase">
                                  BUY
                                </button>
                              ) : (
                                <button className="flex w-[120px] flex-row items-center justify-center gap-1 rounded-[10px] border-2 border-red-600 py-2 font-semibold uppercase">
                                  BID
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BipDetails;
