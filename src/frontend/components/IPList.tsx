import { Principal } from "@dfinity/principal";
import { backendActor } from "./actors/BackendActor";
import IPItem from "./IPItem";
import { useEffect } from "react";

// Declare tuple types for useQueryCall args
type GetIntPropsArgs = [{ prev: [] | [bigint]; take: [] | [bigint] }];
type GetIntPropsOfArgs = [{ owner: Principal; prev: [] | [bigint]; take: [] | [bigint] }];

interface IPListProps {
  owner: Principal | undefined;
}

const IPList: React.FC<IPListProps> = ({ owner }) => {
  const functionName = owner === undefined ? "get_listed_int_props" : "get_int_props_of";
  
  // Use declared tuple types
  const args: GetIntPropsArgs | GetIntPropsOfArgs = owner === undefined
    ? [{ prev: [], take: [BigInt(10)] }]
    : [{ owner, prev: [], take: [BigInt(10)] }];

  const { data: entries, call: fetchEntries } = backendActor.useQueryCall({
    functionName,
    args,
  });

  useEffect(() => {
    fetchEntries(args);
  }, [owner]);

  return (
    <>
      {entries === undefined ? (
        <div className="text-center text-white p-24">
          Loading...
        </div>
      ) : (
        <ul>
          {entries.map((intPropId) => (
            <li
              className="w-full m-12 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg max-w-8xl my-4 mx-auto"
              key={intPropId}
            >
              <IPItem intPropId={intPropId} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default IPList;
