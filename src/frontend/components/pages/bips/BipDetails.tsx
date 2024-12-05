import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { useParams } from "react-router-dom";
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
import GenerateCertificate from "./GenerateCertificate";
import { IntProp } from "../../../../declarations/backend/backend.did";

// @ts-ignore
import { getName } from "country-list";
import BanIntProp from "../../common/BanIntProp";
import AirdropEligible from "../../common/AirdropEligible";
import UserNickName from "../../common/UserNickname";

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

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
  }

  return (
    <div className="flex w-full flex-1 flex-col items-start justify-start gap-y-4 overflow-auto bg-primary text-white h-full">
      <BipsHeader/>
      <div className="w-full h-full sm:p-8 md:p-4">
        <div className="flex w-full h-full flex-1 flex-col items-center justify-center overflow-auto bg-tertiary sm:rounded-xl">
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
            <div className="flex flex-col items-center justify-center h-full">
              <h1>❌ Error</h1>
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex flex-col items-center justify-center text-xl font-bold">
                  IP Not Accessible
                </div>
                <div className="flex flex-col items-center justify-center text-medium">
                  This IP address is either unlisted or not in your ownership. Only IP owners can view their assets in their bIP Wallet.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full h-full flex-col gap-y-4 rounded-xl p-4 sm:w-2/3 sm:px-12 sm:py-4 items-center justify-between">
              {
                intProp.ok.V1.dataUri && <FilePreview dataUri={intProp.ok.V1.dataUri} />
              }
              <div className="py-2 flex flex-col text-xl text-base font-bold items-center w-full">
                { intProp.ok.V1.title }
                { isBanned ? 
                  <div className="text-base text-red-500">
                    This IP has been banned ❌
                  </div> : 
                  <AirdropEligible intPropId={BigInt(intPropId)}/>
                }
              </div>
              <div className="py-2 text-md text-base text-justify">
                {intProp.ok.V1.description}
              </div>
              <table className="w-full text-left rtl:text-right">
                <tr className="border-b">
                  <th className="whitespace-nowrap font-medium text-white">💎 Type </th>
                  <td className="font-semibold text-right"> {intPropTypeToString(intProp.ok.V1.intPropType)}</td>
                </tr>
                <tr className="border-b">
                  <th className="whitespace-nowrap font-medium text-white">⚖️ Licenses</th>
                  <td className="font-semibold text-right">
                  {
                    intProp.ok.V1.intPropLicenses.length === 0 ? 
                      <div className="italic font-light">None</div> :
                      <div>{intProp.ok.V1.intPropLicenses.map(intPropLicenseToString).join(", ")}</div>
                  }
                  </td>
                </tr>
                <tr className="border-b">
                  <th className="whitespace-nowrap font-medium text-white">📅 Creation Date</th>
                  <td className="font-semibold text-right">{formatDate(timeToDate(intProp.ok.V1.creationDate))}</td>
                </tr>
                <tr className="border-b">
                  <th className="whitespace-nowrap font-medium text-white">👑 Royalties</th>
                  <td className="font-semibold text-right">
                    { fromNullable(intProp.ok.V1.percentageRoyalties) ?
                      <div>{fromNullable(intProp.ok.V1.percentageRoyalties)?.toString()}%</div> : <div className="italic font-light">None</div>
                    }</td>
                </tr>
                <tr className="border-b">
                  <th className="whitespace-nowrap font-medium text-white">📜 Publishing</th>
                  <td className="font-semibold text-right">
                    {
                      fromNullable(intProp.ok.V1.publishing) ? 
                      <div className="flex flex-row space-x-1 justify-end"> 
                        {getName(fromNullable(intProp.ok.V1.publishing)?.countryCode)}
                        {", "}	
                        { getPublishingDate(intProp.ok.V1) }</div> 
                      : <div className="italic font-light">None</div>
                    }
                    
                  </td>
                </tr>
                <tr className={`${showUserDetails ? "" : "border-b"} hover:cursor-pointer hover:bg-blue-800`} onClick={() => setShowUserDetails(!showUserDetails)}>
                  <th className="whitespace-nowrap font-medium text-white">👨‍🎨 Author</th>
                  <td className="font-semibold flex flex-row space-x-1 justify-end">
                    {!showUserDetails && <UserNickName principal={intProp.ok.V1.author} />}
                  </td> 
                </tr>
                {
                  showUserDetails && (
                    <tr>
                      <td colSpan={2} className="border-b w-full px-5 text-gray-200">
                        <UserDetails
                          principal={intProp.ok.V1.author}
                        />
                      </td>
                    </tr>
                  )
                }
                <tr>
                  <th className="whitespace-nowrap font-medium text-white">🗝️ Owner</th>
                  <th className="text-sm font-medium text-right">
                    { owner?.toString() }
                  </th>
                </tr>
              </table>
              <div className="flex flex-col space-y-1 space-x-0 sm:flex-row sm:space-x-1 sm:space-y-0 items-right w-full justify-end">
                <GenerateCertificate intPropId={intPropId} intProp={intProp.ok.V1}/>
                <BanIntProp principal={principal} intPropId={BigInt(intPropId)} />
                <div className="flex items-center justify-center">{owner && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BipDetails;
