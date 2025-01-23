import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor.js";
import {
  fromNullableExt,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions.js";
import FilePreview from "../../common/FilePreview.js";

import AIBotImg from "../../../assets/ai-bot.png";
import { Principal } from "@dfinity/principal";
import ListingDetails from "../../common/ListingDetails.js";
import AirdropEligible from "../../common/AirdropEligible.js";
import { useActors } from "../../common/ActorsContext.js";
import { fromNullable } from "@dfinity/utils";
import { IntProp } from "../../../../declarations/backend/backend.did.js";

interface BipItemProps {
  intPropId: bigint;
}

const BipItem: React.FC<BipItemProps> = ({ intPropId }) => {

  const { unauthenticated } = useActors();
  
  const [owner, setOwner] = useState<Principal | undefined>(undefined);
  const [intProp, setIntProp] = useState<IntProp | undefined>(undefined);

  useEffect(() => {
    unauthenticated?.backend.owner_of({ token_id: BigInt(intPropId) }).then((data) => {
      setOwner(fromNullable(data));
    });
    unauthenticated?.backend.get_int_prop({ token_id: BigInt(intPropId) }).then((data) => {
      setIntProp("ok" in data ? data.ok.V1 : undefined)
    });
  }, [intPropId, unauthenticated]);

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
        <Link className="w-full h-96 sm:w-72" to={`/bip/${intPropId}`}>
          <div className="bg-tertiary flex flex-col gap-y-1 rounded-2xl p-3 text-base text-white h-full">
            {intProp.dataUri ? (
              <div className="w-full">
                <FilePreview
                  dataUri={intProp.dataUri}
                  className="h-48 w-full rounded-xl object-cover flex flex-col items-center justify-center"
                />
              </div>
            ) : (
              <img
                src={AIBotImg}
                className="h-48 w-full rounded-xl border border-gray-300 object-cover shadow-md "
                alt="Logo"
              />
            )}
            <div className="grid grid-cols-6">
              <p className="truncate text-2xl font-semibold col-span-5">
                {intProp.title}
              </p>
              <div className="justify-self-end">
                <AirdropEligible intPropId={intPropId} compact={true} />
              </div>
            </div>
            <p className="truncate font-semibold text-base">
              Type: {intPropTypeToString(intProp.intPropType)}
            </p>
            {intProp.intPropLicenses.length > 0 && (
              <p className="truncate font-semibold text-base">
                Licenses: {intProp.intPropLicenses
                  .map(intPropLicenseToString)
                  .join(", ")}
              </p>
            )}
            {/* Use `flex-grow` to push the last child to the bottom */}
            <div className="flex-grow"></div>
            <div>
              {owner && (
                <ListingDetails
                  owner={owner}
                  intPropId={intPropId}
                  updateBipDetails={() => {}}
                />
              )}
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default BipItem;
