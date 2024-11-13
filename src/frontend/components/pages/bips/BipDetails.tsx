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
import SensitiveContent from "../../common/SensitiveContent";
import TagSensitive from "../../common/TagSensitive";
import AirdropEligible from "../../common/AirdropEligible";

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  
  const [owner, setOwner] = useState<Principal | undefined>(undefined);

  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

  const { data: sensitive, call: getSensitive } = backendActor.useQueryCall({
    functionName: "is_sensitive_int_prop",
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
    getSensitive();
  };

  const getPublishingDate = (ip: IntProp) => {

    const publish = fromNullable(ip.publishing);

    if (publish !== undefined) {
      return formatDate(timeToDate(publish.date));
    }

    return "N/A";
  }

  return (
    <div className="flex w-full flex-1 flex-col items-start justify-start gap-y-4 overflow-auto bg-primary text-white">
      <BipsHeader/>
      <div className="w-full sm:p-8 md:p-4">
        <div className="flex w-full flex-1 flex-col items-center justify-center overflow-auto rounded-xl bg-tertiary sm:rounded-3xl">
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
              <h1>Error</h1>
              <p>{"Cannot find IP"}</p>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-y-4 rounded-3xl p-4 sm:w-2/3 sm:px-12 sm:py-4">
              {
                intProp.ok.V1.dataUri && 
                <SensitiveContent sensitive={sensitive !== undefined ? sensitive : true}>
                  <FilePreview dataUri={intProp.ok.V1.dataUri} className="h-60 w-full object-cover sm:w-96"/>
                </SensitiveContent>
              }
              <div className="flex flex-col">
                <div className="py-2 text-xl text-base font-bold">
                  {intProp.ok.V1.title}
                </div>
                <AirdropEligible intPropId={BigInt(intPropId)}/>
                <div className="py-2 text-md text-base">
                  {intProp.ok.V1.description}
                </div>
                <div className="flex flex-col gap-2 text-lg">
                  <p> Type: {intPropTypeToString(intProp.ok.V1.intPropType)}</p>
                  {
                    intProp.ok.V1.intPropLicenses.length > 0 && 
                    <p>
                      Licenses: {intProp.ok.V1.intPropLicenses.map(intPropLicenseToString).join(", ")}
                    </p>
                  }
                  <p>
                    Creation Date:{" "}
                    {
                      formatDate(timeToDate(intProp.ok.V1.creationDate))
                    }
                  </p>
                  {
                    fromNullable(intProp.ok.V1.percentageRoyalties) !== undefined && <p>
                      Royalties: {fromNullable(intProp.ok.V1.percentageRoyalties)?.toString()}%
                    </p>
                  }
                  {
                    fromNullable(intProp.ok.V1.publishing) && <p>
                      Publishing Date:{" "}
                      { getPublishingDate(intProp.ok.V1) }
                    </p>
                  }
                  {
                    fromNullable(intProp.ok.V1.publishing) && <p>
                      Publishing country: {" "}
                      {getName(fromNullable(intProp.ok.V1.publishing)?.countryCode)}
                    </p>
                  }
                  <UserDetails
                    principal={intProp.ok.V1.author}
                    title="Author(s) Details"
                  />
                  {owner && (
                    <UserDetails principal={owner} title="Owner(s) Details" />
                  )}
                </div>
              </div>
              <div className="flex flex-row flex-wrap space-x-1 space-y-1 justify-between">
                <GenerateCertificate intPropId={intPropId} intProp={intProp.ok.V1}/>
                <TagSensitive principal={principal} intPropId={BigInt(intPropId)} />
                <div>{owner && (
                  <ListingDetails
                    principal={principal}
                    owner={owner}
                    intPropId={BigInt(intPropId)}
                    updateBipDetails={updateBipDetails}
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
