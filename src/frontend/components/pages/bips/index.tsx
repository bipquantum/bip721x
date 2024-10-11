import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";

import BipItem from "./BipItem";
import { backendActor } from "../../actors/BackendActor";
import Balance from "../../common/Balance";
import ToggleSwitch from "../../common/ToggleSwitch";

import FilterSvg from "../../../assets/filter.svg";
import InfiniteScroll from "react-infinite-scroll-component";
import BipsHeader from "./BipsHeader";

export enum FilterType {
  LISTED,
  OWNED,
}

interface BipsProps {
  principal: Principal | undefined;
}

const take: [] | [bigint] = [BigInt(5)];

const Bips: React.FC<BipsProps> = ({ principal }) => {
  const [isListedIPs, setIsListedIPs] = useState(true);
  const [filterBy, setFilterBy] = useState<FilterType>(FilterType.LISTED);
  const [entries, setEntries] = useState<bigint[]>([]); // Store fetched entries
  const [prev, setPrev] = useState<[] | [bigint]>([]); // Keep track of previous entries
  const [loading, setLoading] = useState(false); // Loading state to prevent double fetch
  const [hasMore, setHasMore] = useState(true);

  if (!principal) return <></>;

  const { call: fetchEntries } = backendActor.useQueryCall({
    functionName:
      filterBy === FilterType.OWNED
        ? "get_int_props_of"
        : "get_listed_int_props",
    args:
      principal && filterBy === FilterType.OWNED
        ? [{ owner: principal, prev, take }]
        : [{ prev, take }],
  });

  // Fetch entries function
  const loadEntries = async () => {
    if (loading) return;
    setLoading(true);
    const result = await fetchEntries();
    if (result && result.length > 0) {
      setHasMore(true);
      setEntries((prevEntries) => [...prevEntries, ...result]); // Append new entries
      setPrev([BigInt(result[result.length - 1])]);
    } else setHasMore(false);
    setLoading(false);
  };

  // Load initial entries on component mount
  useEffect(() => {
    loadEntries();
  }, [principal, filterBy]);

  useEffect(() => {
    setEntries([]);
    setPrev([]);
    if (isListedIPs) setFilterBy(FilterType.LISTED);
    else setFilterBy(FilterType.OWNED);
  }, [isListedIPs]);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-y-4 overflow-y-auto bg-primary py-4 text-white sm:items-start sm:p-0">
      <BipsHeader/>
      <div className="flex w-full flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:px-8">
        <button className="hidden sm:flex">
          <img src={FilterSvg} className="h-8 invert" alt="Logo" />
        </button>
        <Balance principal={principal} />
        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-center">
          <div className="flex items-center gap-3">
            <p className="text-sm sm:text-xl">
              {isListedIPs ? "Listed IPs" : "My IPs"}
            </p>
            <ToggleSwitch vaule={isListedIPs} setValue={setIsListedIPs} />
          </div>
        </div>
      </div>
      <div className="h-[720px] w-full overflow-y-auto" id="scrollableDiv">
        <InfiniteScroll
          dataLength={entries.length}
          next={loadEntries}
          hasMore={hasMore}
          loader={
            loading && (
              <div className="py-4 text-center">
                <span className="text-lg font-bold">Loading...</span>
              </div>
            )
          }
          scrollableTarget="scrollableDiv"
        >
          <div className="grid grid-cols-2 gap-2 sm:m-0 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {entries?.map((intPropId, index) => (
              <BipItem intPropId={intPropId} key={index} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Bips;
