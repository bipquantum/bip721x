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
import SensitiveContent from "../../common/SensitiveContent";

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

  const { data: sensitive } = backendActor.useQueryCall({
    functionName: "is_sensitive_int_prop",
    args: [{ id: intPropId }],
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
          <h1>Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <SensitiveContent sensitive={sensitive ?? true}>
          <Link className="w-44 sm:w-72 sm:p-2" to={`/bip/${intPropId}`}>
            <div className="bg-tertiary flex flex-col gap-y-1 rounded-2xl p-3 text-base text-white sm:p-4">
              {intProp.ok.V1.dataUri ? (
                <div className="w-full">
                  <FilePreview
                    dataUri={intProp.ok.V1.dataUri}
                    className="h-[111px] w-full rounded-xl object-cover sm:h-[184px]"
                  />
                </div>
              ) : (
                <img
                  src={AIBotImg}
                  className="mb-2 h-[111px] w-full rounded-xl border border-gray-300 object-cover shadow-md sm:h-[184px]"
                  alt="Logo"
                />
              )}
              <div className="flex items-center justify-between font-semibold">
                <p className="text-base sm:text-2xl">{intProp.ok.V1.title}</p>
              </div>
              <p className="text-sm font-semibold sm:text-base">
                Type: {intPropTypeToString(intProp.ok.V1.intPropType)}
              </p>
              {
                intProp.ok.V1.intPropLicenses.length > 0 && 
                <p className="text-sm font-semibold sm:text-base">
                  Licenses: {intProp.ok.V1.intPropLicenses.map(intPropLicenseToString).join(", ")}
                </p>
              }
              { owner && <ListingDetails principal={principal} owner={owner} intPropId={intPropId} updateBipDetails={() => {}} /> }
            </div>
          </Link>
        </SensitiveContent>
      )}
    </>
  );
};

export default BipItem;
