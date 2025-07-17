import React from 'react';
import SearchSvg from "../../assets/search-button.svg";
import { useSearch } from './SearchContext';
import { useMiniSearch } from 'react-minisearch';
import { Link } from 'react-router-dom';

const SearchIPInput = () => {
  const { documents, options } = useSearch();
  const { search, searchResults } = useMiniSearch(documents, options);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    search(event.target.value)
  }

  return (
    <div className="flex flex-col relative">
      <div className="group flex w-full sm:w-[320px] items-center justify-start rounded-2xl border-opacity-40 bg-white dark:bg-white/10 px-4">
        <img src={SearchSvg} className="h-5" alt="" />
        <input type='text' onChange={handleSearchChange} placeholder='Search IP' className="bg-transparent text-gray-900 dark:text-white rounded-lg px-2 py-2 w-full" />
      </div>
      { searchResults !== null && searchResults.length > 0 && <ol className="absolute top-full left-0 border border-gray-300 rounded-lg shadow-lg overflow-y-auto bg-white dark:bg-gray-800 z-10">
        {
          searchResults.map((result, i) => {
            return <li key={i} className="min-w-64">
              <Link to={`/bip/${result.id}`}>
                {result.title}
              </Link>
            </li>
          })
        }
      </ol>
      }
    </div>
  )
}

export default SearchIPInput;
