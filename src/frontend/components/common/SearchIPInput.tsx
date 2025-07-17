import React, { useEffect } from 'react';
import { useSearch } from './SearchContext';
import { useMiniSearch } from 'react-minisearch';

const SearchIPInput = () => {
  const { documents, options } = useSearch();
  const { search, searchResults } = useMiniSearch(documents, options);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    search(event.target.value)
  }

  useEffect(() => {
    if (searchResults !== null && searchResults.length > 0) {
      console.log("Search results:", searchResults);
    } else {
      console.log("No search results found.");
    }
  }, [searchResults]);

  return (
    <div className="bg-red-300 flex flex-col">
      <input type='text' onChange={handleSearchChange} placeholder='Search…' className="bg-green-300"/>
      <ol>
        <h3>Results:</h3>
        {
          searchResults && searchResults.map((result, i) => {
            return <li key={i}>{ result.id }</li>
          })
        }
      </ol>
    </div>
  )
}

export default SearchIPInput;
