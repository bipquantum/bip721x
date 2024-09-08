import { useNavigate } from "react-router-dom";

import {
  intPropLicenseToString,
  intPropTypeToString,
} from "../utils/conversions";
import { backendActor } from "./actors/BackendActor";
import { toast } from "react-toastify";
import IPPrice from "./IPPrice";
import UserDetails from "./UserDetails";
import FilePreview from "./FilePreview";
import { IntProp } from "../../declarations/backend/backend.did";

interface IPItemProps {
  intProp: IntProp;
  intPropId: bigint;
}

const IPItem : React.FC<IPItemProps> = ({intProp, intPropId}) => {

  const navigate = useNavigate();

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const triggerBuy = (intPropId: bigint) => {
    buyIntProp([{ token_id: intPropId }]).then((result) => {
      if (!result) {
        toast.warn("Failed to buy: undefined error");
      } else {
        if ("ok" in result) {
          toast.success("Success");
          navigate(`/ip/${intPropId.toString()}`);
        } else {
          toast.warn("Failed to buy");
        }
        console.log(result);
      }
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-200">
        <div>
          <div className="text-sm font-semibold text-black dark:text-white">
            CATEGORY
          </div>
          <div className="text-lg font-bold text-black dark:text-white">
            { intPropTypeToString(intProp.intPropType) }
          </div>
        </div>
        <IPPrice intPropId={intPropId} />
        <div>
          <div className="text-sm font-semibold text-black dark:text-white">
            IP License
          </div>
          <div className="text-lg font-bold text-black dark:text-white">
            { intPropLicenseToString(intProp.intPropLicense) }
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-black dark:text-white">
            Publishing date
          </div>
          <div className="text-lg font-bold text-black dark:text-white">
            { new Date(Number(intProp.creationDate)).toLocaleDateString() }{" "}
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="p-6 rounded-lg flex justify-between items-center">
          <div className="flex flex-row items-center">
            <div>
              <h1 className="font-bold text-black dark:text-white text-2xl ">
                {intProp.title}{" "}
              </h1>
              <h3 className="text-xs  mt-1text-black dark:text-white ml-4 ">
                {intProp.description}{" "}
              </h3>
            </div>
          </div>
          <div className="w-1/2">
            <FilePreview dataUri={intProp.dataUri} />
          </div>
        </div>
        <h3>Author</h3>
        <UserDetails principal={intProp.author} />
        <div className="flex gap-4">
          <button
            onClick={() => { triggerBuy(intPropId); }}
            className="block text-white dark:text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            Buy
          </button>
          <button
            className="block text-white dark:text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => {
              navigate(`/ip/${intPropId.toString()}`);
            }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default IPItem;
