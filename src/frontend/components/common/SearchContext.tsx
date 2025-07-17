import MiniSearch, { Options } from "minisearch";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { backendActor } from "../actors/BackendActor";
import { EQueryDirection, toQueryDirection } from "../../utils/conversions";

interface SearchContextType {
  documents: any[];
  options: Options<any>;
}

type Document = {
  id: number;
  title: string;
  description: string;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [documents, setDocuments] = React.useState<Document[]>([]);

  const { data: intPropIds } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
    args: [{
      prev: [],
      take: [100_000n], // For now 100k should be quite enough to cover all BIPs
      direction: toQueryDirection(EQueryDirection.Forward)
    }]
  });

  const { call: getIntProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
  });

  useEffect(() => {
    if (intPropIds !== undefined) {
      const fetchIntProps = async () => {
        
        let docs: Document[] = [];
        await Promise.all(
          intPropIds.map(async (id) => {
            const result = await getIntProp([{ token_id: id }]);
            if (result && 'ok' in result) {
              docs.push({
                id: Number(id),
                title: result.ok.V1.title,
                description: result.ok.V1.description,
              });
            }
          })
        );
        setDocuments(docs);
      };
      fetchIntProps();
    }
  }, [intPropIds]);

  const options = {
    fields: ["title", "description"], // Fields to index
    storeFields: ["title"], // Fields to return in search results
    idField: "id", // Unique identifier for each document
  };
  
  //let miniSearch = undefined;
  //const saved = localStorage.getItem("searchIndex");
  //if (saved !== null) {
    //miniSearch = MiniSearch.loadJSON(JSON.parse(saved), options);
  //} else {
  //    miniSearch = new MiniSearch(options);
  //}

//
//  // Update the search index with the fetched data
//  // @todo: If IDs from data are missing in the index, they will be added
//  // @todo: If IDs from index are missing from data, they will be removed
//  if (data !== undefined) {
//    // @todo: query missing IPs individually with backend.get_int_prop
//    miniSearch.addAll(data.map((id: bigint) => ({
//      id,
//      title: "todo",
//      description: "todo",
//    })));
//    localStorage.setItem("searchIndex", JSON.stringify(miniSearch.toJSON()));
//  }

  return (
    <SearchContext.Provider value={{documents, options}}>
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
