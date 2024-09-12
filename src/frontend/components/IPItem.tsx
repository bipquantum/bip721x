import { Principal } from "@dfinity/principal";

import {
  intPropLicenseToString,
  intPropTypeToString,
} from "../utils/conversions";
import { backendActor } from "./actors/BackendActor";
import UserDetails from "./UserDetails";
import FilePreview from "./common/FilePreview";
import ListingDetails from "./ListingDetails";

interface IPItemProps {
  principal: Principal | undefined;
  intPropId: bigint;
}

const IPItem: React.FC<IPItemProps> = ({ principal, intPropId }) => {
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  return (
    <div>
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
        <div>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-200 p-4 md:grid-cols-4">
            <div>
              <div className="text-sm font-semibold text-black dark:text-white">
                CATEGORY
              </div>
              <div className="text-lg font-bold text-black dark:text-white">
                {intPropTypeToString(intProp.ok.intPropType)}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-black dark:text-white">
                IP License
              </div>
              <div className="text-lg font-bold text-black dark:text-white">
                {intPropLicenseToString(intProp.ok.intPropLicense)}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-black dark:text-white">
                Publishing date
              </div>
              <div className="text-lg font-bold text-black dark:text-white">
                {new Date(Number(intProp.ok.creationDate)).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex items-center justify-between rounded-lg p-6">
              <div className="flex flex-row items-center">
                <div>
                  <h1 className="text-2xl font-bold text-black dark:text-white">
                    {intProp.ok.title}{" "}
                  </h1>
                  <h3 className="mt-1text-black ml-4 text-xs dark:text-white">
                    {intProp.ok.description}{" "}
                  </h3>
                </div>
              </div>
              <div className="w-1/2">
                <FilePreview dataUri={intProp.ok.dataUri} />
              </div>
            </div>
            <h3>Author</h3>
            <UserDetails principal={intProp.ok.author} />
            <ListingDetails principal={principal} intPropId={intPropId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default IPItem;
