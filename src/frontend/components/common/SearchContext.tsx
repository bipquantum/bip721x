import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import MiniSearch, { Options } from "minisearch";
import { useActors } from "./ActorsContext";
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
  author: string;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const REFRESH_INTERVAL = 10000; // 10 seconds
const STORAGE_VERSION = 2;
const STORAGE_KEY = "miniSearchDocuments";
const VERSION_KEY = "miniSearchVersion";

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { unauthenticated } = useActors();
  
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const version = localStorage.getItem(VERSION_KEY);

      if (version !== String(STORAGE_VERSION)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
        return [];
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      const docs = raw ? JSON.parse(raw) : [];
      return docs;
    } catch (err) {
      console.error("[SearchContext] Failed to parse cached documents:", err);
      return [];
    }
  });

  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [intPropIds, setIntPropIds] = useState<bigint[]>([]);

  const fetchIntProps = async (ids: number[]): Promise<Document[]> => {
    if (!unauthenticated) {
      console.warn("[SearchContext] Cannot fetch intProps - authenticated actor not available");
      return [];
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await unauthenticated.backend.get_int_prop({ token_id: BigInt(id) });
          if (result && "ok" in result) {
            const doc = {
              id,
              title: result.ok.intProp.V1.title,
              description: result.ok.intProp.V1.description,
              author: result.ok.author?.[0] ?? "",
            };
            return doc;
          } else {
            console.warn(`[SearchContext] Failed to fetch intProp ${id}: result not ok`);
          }
        } catch (err) {
          console.error(`[SearchContext] Error fetching intProp ${id}:`, err);
        }
        return null;
      }),
    );

    const validResults = results.filter((r): r is Document => r !== null);
    return validResults;
  };

  const refreshDocuments = useCallback(async () => {
    if (!unauthenticated) {
      return;
    }
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      const result = await unauthenticated.backend.get_listed_int_props({
        prev: [],
        take: [100_000n],
        direction: toQueryDirection(EQueryDirection.Forward),
      });

      // Ensure result is valid and convert bigints to numbers safely
      if (Array.isArray(result)) {
        setIntPropIds(result);
        setLastRefreshTime(Date.now());
      } else {
        console.error("[SearchContext] Invalid result from get_listed_int_props:", result);
      }
    } catch (err) {
      console.error("[SearchContext] Failed to refresh int prop IDs:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [unauthenticated, isRefreshing]);

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

    const missingIds = Array.from(upToDateIds).filter(
      (id) => !currentIds.has(id),
    );
    const removedIds = Array.from(currentIds).filter(
      (id) => !upToDateIds.has(id),
    );

    if (missingIds.length > 0 || removedIds.length > 0) {

      (async () => {
        const newDocs = await fetchIntProps(missingIds);
        setDocuments((prevDocs) => {
          const keptDocs = prevDocs.filter(
            (doc) => !removedIds.includes(doc.id),
          );

          // Ensure no duplicates by creating a Map and converting back to array
          const allDocs = [...keptDocs, ...newDocs];
          const docMap = new Map<number, Document>();

          allDocs.forEach(doc => {
            if (doc && typeof doc.id === 'number') {
              docMap.set(doc.id, doc);
            }
          });

          const finalDocs = Array.from(docMap.values());
          return finalDocs;
        });
      })();
    }
  }, [intPropIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (err) {
      console.error("[SearchContext] Failed to cache documents to localStorage:", err);
    }
  }, [documents]);

  const options: Options<Document> = {
    fields: ["title", "description", "author"],
    storeFields: ["title"],
    idField: "id",
  };

  const miniSearch = useMemo(() => {
    const search = new MiniSearch(options);

    try {
      // Ensure documents have unique IDs before adding
      const uniqueDocuments = documents.filter((doc, index, arr) =>
        arr.findIndex(d => d.id === doc.id) === index
      );

      const duplicateCount = documents.length - uniqueDocuments.length;
      if (duplicateCount > 0) {
        console.warn("[SearchContext] Removed", duplicateCount, "duplicate documents");
      }

      if (uniqueDocuments.length > 0) {
        search.addAll(uniqueDocuments);
      }
    } catch (error) {
      console.error("[SearchContext] Error adding documents to MiniSearch:", error);
      // Return an empty search instance if there's an error
      return new MiniSearch(options);
    }

    return search;
  }, [documents, options]);

  return (
    <SearchContext.Provider
      value={{
        refreshDocuments,
        lastRefreshTime,
        isRefreshing,
        miniSearch,
      }}
    >
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
