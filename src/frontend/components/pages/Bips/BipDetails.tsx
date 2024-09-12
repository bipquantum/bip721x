import React, { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useParams } from "react-router-dom";
import { fromNullable } from "@dfinity/utils";

import { backendActor } from "../../actors/BackendActor";
import {
  fromE8s,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";

import AIBotImg from "../../../assets/ai-bot.jpeg";
import FilePreview from "../../common/FilePreview";
import UserDetails from "../../common/UserDetails";
import ListingDetails from "../../common/ListingDetails";

interface IPItemProps {
  principal: Principal | undefined;
}

const BipDetails: React.FC<IPItemProps> = ({ principal }) => {
  const [price, setPrice] = useState("");
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const { ipId: intPropId } = useParams();
  if (!intPropId) return <></>;

  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: BigInt(intPropId) }],
  });

  const { data: owners } = backendActor.useQueryCall({
    functionName: "owners_of",
    args: [{ token_ids: [BigInt(intPropId)] }],
  });

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: BigInt(intPropId) }],
  });

  useEffect(() => {
    if (e8sPrice && "ok" in e8sPrice) {
      const price = fromE8s(e8sPrice.ok).toFixed(2);
      setPrice(price);
    } else setPrice("N/A");
  }, [e8sPrice]);

  useEffect(() => {
    const owner =
      owners?.length === 1 ? fromNullable(owners[0])?.[0] : undefined;
    setOwner(owner);
  }, [owners]);

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
          <h1>Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <div className="m-auto flex w-2/3 flex-col gap-y-4 rounded-3xl bg-white px-12 py-4">
          {intProp.ok.dataUri && (
            <div className="w-full">
              <p> Preview </p>
              <FilePreview dataUri={intProp.ok.dataUri} />
            </div>
          )}
          <div className="text-sm">
            <div className="py-2 text-base font-bold">{intProp.ok.title}</div>
            <div className="text-lg">
              <p> Type: {intPropTypeToString(intProp.ok.intPropType)}</p>
              <p>
                License: {intPropLicenseToString(intProp.ok.intPropLicense)}{" "}
              </p>
              <p>
                Creation Date:{" "}
                {
                  new Date(Number(intProp.ok.creationDate.toString()))
                    .toISOString()
                    .split("T")[0]
                }
              </p>
              <p>
                Publish Date:{" "}
                {
                  new Date(Number(intProp.ok.publishingDate.toString()))
                    .toISOString()
                    .split("T")[0]
                }
              </p>
              <UserDetails
                principal={intProp.ok.author}
                title="Author(s) Details"
              />
              {owner && (
                <UserDetails principal={owner} title="Owner(s) Details" />
              )}
            </div>
          </div>
          <ListingDetails principal={principal} intPropId={BigInt(intPropId)} />
        </div>
      )}
    </>
  );
};

export default BipDetails;
