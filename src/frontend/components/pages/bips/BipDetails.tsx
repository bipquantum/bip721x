import React, { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useParams } from "react-router-dom";
import { fromNullable } from "@dfinity/utils";

import { backendActor } from "../../actors/BackendActor";
import {
  formatDate,
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

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  const [owner, setOwner] = useState<Principal | undefined>(undefined);

  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

  const { data: intProp, call: getIntProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: BigInt(intPropId) }],
  });

  const { data: optOwner, call: getOptOwner } = backendActor.useQueryCall({
    functionName: "owner_of",
    args: [{ token_id: BigInt(intPropId) }],
  });

  const updateBipDetails = () => {
    getIntProp();
    getOptOwner();
  };

  useEffect(() => {
    setOwner(optOwner ? fromNullable(optOwner) : undefined);
  }, [optOwner]);

  const getPublishingDate = (ip: IntProp) => {

    if (ip.publishingDate !== undefined) {
      const date = fromNullable(ip.publishingDate);
      if (date !== undefined) {
        return formatDate(timeToDate(date));
      }
    }

    return "N/A";
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col items-start justify-start gap-y-4 overflow-auto bg-primary text-white">
      <BipsHeader/>
      <div className="h-full w-full sm:p-8 md:p-4">
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-auto rounded-xl bg-tertiary sm:rounded-3xl">
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
              {intProp.ok.V1.dataUri && (
                <div className="w-full">
                  <p> Preview </p>
                  <FilePreview dataUri={intProp.ok.V1.dataUri} className="h-60 w-full object-cover sm:w-96"/>
                </div>
              )}
              <div className="text-sm">
                <div className="py-2 text-base font-bold">
                  {intProp.ok.V1.title}
                </div>
                <div className="flex flex-col gap-2 text-lg">
                  <p> Type: {intPropTypeToString(intProp.ok.V1.intPropType)}</p>
                  <p>
                    License: {intPropLicenseToString(intProp.ok.V1.intPropLicense)}{" "}
                  </p>
                  <p>
                    Creation Date:{" "}
                    {
                      formatDate(timeToDate(intProp.ok.V1.creationDate))
                    }
                  </p>
                  <p>
                    Publish Date:{" "}
                    { getPublishingDate(intProp.ok.V1) }
                  </p>
                  <UserDetails
                    principal={intProp.ok.V1.author}
                    title="Author(s) Details"
                  />
                  {owner && (
                    <UserDetails principal={owner} title="Owner(s) Details" />
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <GenerateCertificate intPropId={intPropId} intProp={intProp.ok.V1}/>
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
