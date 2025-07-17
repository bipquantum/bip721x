import MiniSearch, { Options } from "minisearch";
import React, { createContext, useContext, useMemo } from "react";
import { backendActor } from "../actors/BackendActor";
import { EQueryDirection, toQueryDirection } from "../../utils/conversions";

interface SearchContextType {
  documents: any[];
  options: Options<any>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  console.log("SearchProvider initialized");

  const { data } = backendActor.useQueryCall({
    functionName: "get_listed_int_props",
    args: [{
      prev: [],
      take: [100_000n], // For now 100k should be quite enough to cover all BIPs
      direction: toQueryDirection(EQueryDirection.Forward)
    }]
  });

  const documents = useMemo<any[]>(() => {
    if (data === undefined) {
      return [];
    }
    // Convert the data to the format expected by MiniSearch
    let docs= data.map((id: bigint) => ({
      id: Number(id), // Convert bigint to number for MiniSearch
      title: "todo", // Placeholder, replace with actual title if available
      description: "todo" // Placeholder, replace with actual description if available
    }));
    console.log("Documents for MiniSearch:", docs);
    return docs;
  }, [data]);

  // These hardcoded documents are just for the sake of example.
//  const documents = useMemo(() => 
//  [
//    {
//      id: 1,
//      title: 'Moby Dock',
//      description: 'Call me Ishmael. Some years ago...',
//    },
//    {
//      id: 2,
//      title: 'Zen and the Art of Motorcycle Maintenance',
//      description: 'I can see by my watch...',
//    },
//    {
//      id: 3,
//      title: 'Neuromancer',
//      description: 'The sky above the port was...',
//    },
//    {
//      id: 4,
//      title: 'Zen and the Art of Archery',
//      description: 'At first sight it must seem...',
//    }
//  ], []);

  const options = {
    fields: ["id"], // Fields to index
    storeFields: ["id"], // Fields to return in search results
    idField: "id", // Unique identifier for each document
  };

//  const options = {
//    fields: ["title", "description"], // Fields to index
//    storeFields: ["title"], // Fields to return in search results
//    idField: "id", // Unique identifier for each document
  //};
  
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
