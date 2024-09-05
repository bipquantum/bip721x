import { Principal } from "@dfinity/principal";
import { Navigate } from "react-router-dom";

import { backendActor } from "./actors/BackendActor";
import {
  intPropLicenseToString,
  intPropTypeToString,
} from "../utils/conversions";
import IPPrice from "./IPPrice";
import UserDetails from "./UserDetails";
import IpOwner from "./IpOwner";

type IPListProps = {
  ownerPrincipal?: Principal;
};

const OwnedIPList = ({ ownerPrincipal }: IPListProps) => {
  if (!ownerPrincipal) return <Navigate to="/login" />;

  const { data: entries } = backendActor.useQueryCall({
    functionName: "get_int_props_of",
    args: [
      {
        owner: ownerPrincipal,
        prev: [],
        take: [BigInt(10)],
      },
    ],
  });

  const { call: buyIntProp } = backendActor.useUpdateCall({
    functionName: "buy_int_prop",
  });

  const triggerBuy = (intPropId: bigint) => {
    buyIntProp([{ token_id: intPropId }]).then((result) => {
      if (!result) {
        console.error("Failed to buy: undefined error");
      } else {
        if ("ok" in result) {
          console.log("Buy succeeded");
        } else {
          console.log("Buy failed");
        }
        console.log(result);
      }
    });
  };

  return (
    <>
      {entries === undefined ? (
        <div
          className="text-center text-white"
          style={{
            padding: "100px",
          }}
        >
          Loading...
        </div>
      ) : "err" in entries ? (
        <div>
          <h1>Error</h1>
          <p>{entries.err}</p>
        </div>
      ) : entries.ok.length === 0 ? (
        <div
          className="text-center text-black dark:text-white"
          style={{
            padding: "100px",
          }}
        >
          Please add your First IP.
        </div>
      ) : (
        <ul>
          {entries.ok.map(([intPropId, intProp]) => (
            <li
              id="order_container"
              className="w-full  m-12 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg max-w-8xl my-4  mx-auto"
              key={intPropId}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-200">
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    CATEGORY
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {intPropTypeToString(intProp.intPropType)}{" "}
                  </div>
                </div>
                <IPPrice intPropId={intPropId} />
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    IP License
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {" "}
                    {intPropLicenseToString(intProp.intPropLicense)}{" "}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    Publishing date
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {" "}
                    {new Date(
                      Number(intProp.creationDate)
                    ).toLocaleDateString()}{" "}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <div
                  id="product_details"
                  className="  p-6 rounded-lg flex justify-between items-center"
                >
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
                </div>
                <div>Author</div>
                <UserDetails principal={intProp.author} />
                <div>Owner</div>
                <IpOwner intPropId={intPropId} />
                <button
                  onClick={() => {
                    triggerBuy(intPropId);
                  }}
                  className="block text-white dark:text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  type="button"
                >
                  Buy
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default OwnedIPList;
