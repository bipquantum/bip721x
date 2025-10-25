import { useEffect, useState, useRef } from "react";

import BipItem from "./BipItem";

import { fromNullable } from "@dfinity/utils";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { QueryDirection } from "../../../../declarations/backend/backend.did";
import { EQueryDirection, toQueryDirection } from "../../../utils/conversions";
import { useAuth } from "@nfid/identitykit/react";
import { useActors } from "../../common/ActorsContext";
import PrivateBipItem from "./PrivateBipItem";
import PublicBipItem from "./PublicBipItem";

interface BipsProps {
  fetchBips: (
    prev: bigint | undefined,
    direction: QueryDirection,
  ) => Promise<bigint[] | undefined>;
  queryDirection: EQueryDirection;
  hideUnlisted?: boolean;
}

const BipList: React.FC<BipsProps> = ({
  fetchBips,
  queryDirection,
  hideUnlisted,
}) => {
  const { user } = useAuth();
  const { unauthenticated, authenticated } = useActors();
  const [entries, setEntries] = useState<Set<bigint>>(new Set()); // Store fetched entries as a Set
  const [prev, setPrev] = useState<bigint | undefined>(undefined); // Keep track of previous entries
  const [loading, setLoading] = useState(false); // Loading state to prevent double fetch
  const loadingRef = useRef(false); // Use ref to track loading without causing re-renders
  const prevRef = useRef<bigint | undefined>(undefined); // Keep prev in ref for stable access

  // Update prevRef when prev changes
  useEffect(() => {
    prevRef.current = prev;
  }, [prev]);

  const loadEntries = async () => {
    if (loadingRef.current) return; // Ensure no double-fetch
    loadingRef.current = true;
    setLoading(true);
    const result = await fetchBips(prevRef.current, toQueryDirection(queryDirection));
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
    loadingRef.current = false;
  };

  // Load initial entries only when actors are ready
  // This fixes the race condition on mainnet F5 refresh
  useEffect(() => {
    // Wait for actors to be available before loading
    if (!unauthenticated && !authenticated) {
      console.log("[BipList] Waiting for actors to initialize...");
      return;
    }
    console.log("[BipList] Actors ready, loading initial entries");
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unauthenticated, authenticated]);

  // Reset and reload when queryDirection changes
  useEffect(() => {
    const resetAndLoadEntries = async () => {
      setEntries(new Set());
      setPrev(undefined);
      prevRef.current = undefined;
      // Wait for actors to be ready before loading
      if (!unauthenticated && !authenticated) {
        console.log("[BipList] Waiting for actors before resetting...");
        return;
      }
      // Small delay to ensure state updates complete
      await new Promise(resolve => setTimeout(resolve, 0));
      await loadEntries(); // Wait for entries to load after reset
    };
    resetAndLoadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryDirection, unauthenticated, authenticated]);

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
      <div
        className={
          "grid w-full flex-grow items-center gap-[20px] md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {Array.from(entries).map((intPropId) => (
          authenticated !== undefined ? <PrivateBipItem
            principal={user?.principal}
            intPropId={intPropId}
            key={intPropId}
            hideUnlisted={hideUnlisted}
          /> : <PublicBipItem
            intPropId={intPropId}
            principal={user?.principal}
            hideUnlisted={hideUnlisted}
          />
        ))}
      </div>
      {(loading || prev !== undefined) && <div ref={sentryRef}></div>}
    </div>
  );
};

export default BipList;
