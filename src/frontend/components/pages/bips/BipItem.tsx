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

interface BipItemProps {
  principal: Principal;
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
        <Link className="w-full h-96 sm:w-72" to={`/bip/${intPropId}`}>
          <div className="bg-tertiary flex flex-col gap-y-1 rounded-2xl p-3 text-base text-white h-full">
            {intProp.ok.V1.dataUri ? (
              <div className="w-full">
                <FilePreview
                  dataUri={intProp.ok.V1.dataUri}
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
            )}
            {/* Use `flex-grow` to push the last child to the bottom */}
            <div className="flex-grow"></div>
            <div>
              {owner && (
                <ListingDetails
                  principal={principal}
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
