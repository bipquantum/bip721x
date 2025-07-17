import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import MiniSearch, { Options } from "minisearch";
import { backendActor } from "../actors/BackendActor";
import { EQueryDirection, toQueryDirection } from "../../utils/conversions";

interface SearchContextType {
  refreshDocuments: () => Promise<void>;
  lastRefreshTime: number;
  isRefreshing: boolean;
  miniSearch: MiniSearch<Document>;
}

type Document = {
  id: number; // Used number instead of bigint for JSON stringification
  title: string;
  description: string;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const REFRESH_INTERVAL = 10000; // 10 seconds

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const raw = localStorage.getItem("miniSearchDocuments");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Failed to parse cached documents", err);
      return [];
    }
  });

  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { data: intPropIds, call: refreshIntPropIds, loading } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
    args: [{
      prev: [],
      take: [100_000n],
      direction: toQueryDirection(EQueryDirection.Forward),
    }],
  });

  const { call: getIntProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
  });

  const fetchIntProps = async (ids: number[]): Promise<Document[]> => {
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await getIntProp([{ token_id: BigInt(id) }]);
          if (result && "ok" in result) {
            return {
              id,
              title: result.ok.V1.title,
              description: result.ok.V1.description,
            };
          }
        } catch (err) {
          console.warn(`Failed to fetch intProp ${id}:`, err);
        }
        return null;
      })
    );
    return results.filter((r): r is Document => r !== null);
  };

  const refreshDocuments = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshIntPropIds();
      setLastRefreshTime(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshIntPropIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshDocuments();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshDocuments]);

  useEffect(() => {
    if (!intPropIds) return;

    const currentIds = new Set(documents.map((doc) => doc.id));
    const upToDateIds = new Set(intPropIds.map((id) => Number(id)));

    const missingIds = Array.from(upToDateIds).filter((id) => !currentIds.has(id));
    const removedIds = Array.from(currentIds).filter((id) => !upToDateIds.has(id));

    if (missingIds.length > 0 || removedIds.length > 0) {
      (async () => {
        const newDocs = await fetchIntProps(missingIds);
        setDocuments((prevDocs) => {
          const keptDocs = prevDocs.filter((doc) => !removedIds.includes(doc.id));
          return [...keptDocs, ...newDocs];
        });
      })();
    }
  }, [intPropIds]);

  useEffect(() => {
    try {
      localStorage.setItem("miniSearchDocuments", JSON.stringify(documents));
    } catch (err) {
      console.warn("Failed to cache documents", err);
    }
  }, [documents]);

  const options: Options<Document> = {
    fields: ["title", "description"],
    storeFields: ["title"],
    idField: "id",
  };

  const miniSearch = useMemo(() => {
    const search = new MiniSearch(options);
    search.addAll(documents);
    return search;
  }, [documents, options]);

  return (
    <SearchContext.Provider value={{
      refreshDocuments,
      lastRefreshTime,
      isRefreshing,
      miniSearch,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
