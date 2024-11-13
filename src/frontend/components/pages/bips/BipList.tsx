import { useEffect, useState } from "react";

import BipItem from "./BipItem";

import { fromNullable, toNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection, toQueryDirection } from "../../../utils/conversions";

interface BipsProps {
  principal: Principal;
  scrollableClassName: string;
  fetchBips: (prev: bigint | undefined, direction: QueryDirection) => Promise<bigint[] | undefined>;
  queryDirection: EQueryDirection;
  BipItemComponent?: React.ComponentType<{ intPropId: bigint, principal: Principal }>;
}

const BipList: React.FC<BipsProps> = ({ principal, scrollableClassName, fetchBips, queryDirection, BipItemComponent = BipItem }) => {

  const [entries, setEntries] = useState<Set<bigint>>(new Set()); // Store fetched entries as a Set
  const [prev,    setPrev   ] = useState<bigint | undefined>(undefined); // Keep track of previous entries
  const [loading, setLoading] = useState(false); // Loading state to prevent double fetch

  const loadEntries = async () => {
    console.log("Loading entries...");
    if (loading) return; // Ensure no double-fetch
    setLoading(true);
    const result = await fetchBips(prev, toQueryDirection(queryDirection));
    if (result && result.length > 0) {
      setEntries((prevEntries) => {
        const newEntries = new Set(prevEntries);
        result.forEach((entry) => newEntries.add(entry));
        return newEntries;
      });
      setPrev(fromNullable([BigInt(result[result.length - 1])]));
      console.log("Prev: ", fromNullable([BigInt(result[result.length - 1])]));
    } else {
      setPrev(undefined);
      console.log("Prev: ", undefined);
      console.log("No more entries to fetch");
    }
    setLoading(false);
  };

  // Load initial entries on component mount
  useEffect(() => {
    loadEntries();
  }, []);

  // TODO: the infinite scroll component does not get refreshed when the queryDirection changes
  useEffect(() => {
    const resetAndLoadEntries = async () => {
      setEntries(new Set());
      setPrev(undefined);
      await loadEntries(); // Wait for entries to load after reset
    };
    resetAndLoadEntries();
  }, [queryDirection]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: prev !== undefined,
    onLoadMore: loadEntries,
    // When there is an error, we stop infinite loading.
    // It can be reactivated by setting "error" state as undefined.
    disabled: false,
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: '0px 0px 100px 0px',
  });

  return (
    <div className="h-full w-full overflow-y-auto px-4" id="scrollableDiv">
      <div className={scrollableClassName}>
        {Array.from(entries).map((intPropId) => (
          <BipItemComponent principal={principal} intPropId={intPropId} key={intPropId} />
        ))}
      </div>
      {(loading || prev !== undefined) && (
        <div ref={sentryRef}></div>
      )}
    </div>
  );
};

export default BipList;
