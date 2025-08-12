import { useEffect, useState } from "react";

import BipItem from "./BipItem";

import { fromNullable, toNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection, toQueryDirection } from "../../../utils/conversions";
import { useAuth, useIdentity } from "@nfid/identitykit/react";

interface BipsProps {
  principal: Principal;
  scrollableClassName: string;
  fetchBips: (
    prev: bigint | undefined,
    direction: QueryDirection,
  ) => Promise<bigint[] | undefined>;
  queryDirection: EQueryDirection;
  BipItemComponent?: React.ComponentType<{
    intPropId: bigint;
    principal: Principal;
  }>;
  isGrid?: boolean;
  triggered?: boolean;
  hideUnlisted?: boolean;
}

const BipList: React.FC<BipsProps> = ({
  principal,
  scrollableClassName,
  fetchBips,
  isGrid,
  queryDirection,
  BipItemComponent = BipItem,
  triggered,
  hideUnlisted,
}) => {
  const identity = useIdentity();
  const [entries, setEntries] = useState<Set<bigint>>(new Set()); // Store fetched entries as a Set
  const [prev, setPrev] = useState<bigint | undefined>(undefined); // Keep track of previous entries
  const [loading, setLoading] = useState(false); // Loading state to prevent double fetch

  const loadEntries = async () => {
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
    } else {
      setPrev(undefined);
    }
    setLoading(false);
  };

  // Load initial entries on component mount
  useEffect(() => {
    loadEntries();
  }, [triggered, identity]);

  // TODO: the infinite scroll component does not get refreshed when the queryDirection changes
  useEffect(() => {
    const resetAndLoadEntries = async () => {
      setEntries(new Set());
      setPrev(undefined);
      await loadEntries(); // Wait for entries to load after reset
    };
    resetAndLoadEntries();
  }, [queryDirection, triggered]);

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
    rootMargin: "0px 0px 100px 0px",
  });

  return (
    <div className="w-full flex-grow" id="scrollableDiv">
      {!isGrid ? (
        <div className={scrollableClassName}>
          {Array.from(entries).map((intPropId) => (
            <BipItemComponent
              principal={principal}
              intPropId={intPropId}
              key={intPropId}
            />
          ))}
        </div>
      ) : (
        <div
          className={
            "grid w-full flex-grow items-center gap-[20px] md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {Array.from(entries).map((intPropId) => (
            <BipItem
              principal={principal}
              intPropId={intPropId}
              key={intPropId}
              hideUnlisted={hideUnlisted}
            />
          ))}
        </div>
      )}
      {(loading || prev !== undefined) && <div ref={sentryRef}></div>}
    </div>
  );
};

export default BipList;
