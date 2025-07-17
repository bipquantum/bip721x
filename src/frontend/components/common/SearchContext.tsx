import { Options } from "minisearch";
import React, { createContext, useContext, useEffect } from "react";
import { backendActor } from "../actors/BackendActor";
import { EQueryDirection, toQueryDirection } from "../../utils/conversions";

interface SearchContextType {
  documents: any[];
  options: Options<any>;
  refreshDocuments: () => void;
}

type Document = {
  id: number; // Used number instead of bigint for JSON stringification
  title: string;
  description: string;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const saved = localStorage.getItem("miniSearchDocuments");

  const [documents, setDocuments] = React.useState<Document[]>(saved !== null ? JSON.parse(saved) : []);

  const { data: intPropIds, call: refreshIntPropIds } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
    args: [{
      prev: [],
      take: [100_000n], // Maximize number of bigint that can be returned in a single query (2MB). 100k should be quite enough to cover all listed BIPs.
      direction: toQueryDirection(EQueryDirection.Forward)
    }]
  });

  const { call: getIntProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
  });

  const refreshDocuments = () => {
    refreshIntPropIds();
  };

  useEffect(() => {
    if (intPropIds !== undefined) {

      let setUpToDateIds = new Set(intPropIds.map(id => Number(id)));
      let setCurrentIds = new Set(documents.map(doc => doc.id));

      // Get missing IPs
      let missingIds = Array.from(setUpToDateIds).filter(id => !setCurrentIds.has(id));
      if (missingIds.length > 0) {
        fetchIntProps(missingIds).then(newDocs => {
          setDocuments(prevDocs => [...prevDocs, ...newDocs]);
        });
      }

      // Remove outdated IPs
      let removedIds = Array.from(setCurrentIds).filter(id => !setUpToDateIds.has(id));
      if (removedIds.length > 0) {
        setDocuments(prevDocs => {
          // Remove documents with IDs that are no longer listed
          return prevDocs.filter(doc => !removedIds.includes(doc.id));
        });
      }
    }
  }, [intPropIds]);

  const fetchIntProps = async (ids: number[]) : Promise<Document[]> => {
        
    let docs: Document[] = [];
    await Promise.all(
      ids.map(async (id) => {
        const result = await getIntProp([{ token_id: BigInt(id) }]);
        if (result && 'ok' in result) {
          docs.push({
            id: Number(id),
            title: result.ok.V1.title,
            description: result.ok.V1.description,
          });
        }
      })
    );
    return docs;
  };

  useEffect(() => {
    localStorage.setItem("miniSearchDocuments", JSON.stringify(documents));
  }, [documents]);

  const options = {
    fields: ["title", "description"], // Fields to index
    storeFields: ["title"], // Fields to return in search results
    idField: "id", // Unique identifier for each document
  };

  return (
    <SearchContext.Provider value={{documents, options, refreshDocuments}}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
