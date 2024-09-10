import { Principal } from "@dfinity/principal";
import { backendActor } from "./actors/BackendActor";
import IPItem from "./IPItem";
import { useEffect } from "react";

export enum FilterType {
  LISTED,
  OWNED,
}

interface IPListProps {
  principal: Principal | undefined;
  filterBy: FilterType;
}

const IPList: React.FC<IPListProps> = ({ principal, filterBy }) => {

  // TODO sardariuss 2024-SEP-09: be able to scroll through the list
  var prev : [] | [bigint] = [];
  var take : [] | [bigint] = [BigInt(10)];

  const { data: entries, call: fetchEntries } = backendActor.useQueryCall({
    functionName: filterBy === FilterType.OWNED ? "get_int_props_of" : "get_listed_int_props",
    args: principal && filterBy === FilterType.OWNED ? [{ owner: principal, prev, take }] : [{ prev, take }],
  });

  useEffect(() => {
    fetchEntries();
  }, [principal]);

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
              <IPItem principal={principal} intPropId={intPropId} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default IPList;
