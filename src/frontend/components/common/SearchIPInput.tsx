import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from './SearchContext';
import { useMiniSearch } from 'react-minisearch';
import { Link } from 'react-router-dom';
import { MdSearch } from 'react-icons/md';

const SearchIPInput = () => {
  const { documents, options } = useSearch();
  const { search, searchResults } = useMiniSearch(documents, options);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    search(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults || searchResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          // Navigate to selected result
          window.location.href = `/bip/${searchResults[selectedIndex].id}`;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setInputValue('');
    setSelectedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex flex-col relative">
      <div className="group flex w-full sm:w-[320px] items-center justify-start rounded-2xl border-opacity-40 bg-white dark:bg-white/10 px-4">
        <MdSearch className="text-gray-500 dark:text-gray-400 h-5 w-5" />
        <input 
          ref={inputRef}
          type='text' 
          value={inputValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder='Search IP' 
          className="bg-transparent text-gray-900 dark:text-white rounded-lg px-2 py-2 w-full outline-none"
        />
      </div>
      
      {isOpen && searchResults && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden bg-background dark:bg-background-dark z-50 max-h-80 overflow-y-auto"
        >
          <div className="px-3 py-2 bg-white dark:bg-white/10 border-b border-gray-200 dark:border-gray-600">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {searchResults.map((result, i) => {
              const isSelected = i === selectedIndex;
              return (
                <li key={result.id} className="group">
                  <Link 
                    to={`/bip/${result.id}`}
                    onClick={handleResultClick}
                    className={`
                      flex flex-col p-4 transition-colors duration-150 
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-white dark:hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`
                        font-medium text-sm line-clamp-1
                        ${isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                        }
                      `}>
                        {truncateText(result.title, 50)}
                      </h3>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${isSelected 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}>
                        BIP #{result.id}
                      </span>
                    </div>
                    
                    {result.description && (
                      <p className={`
                        text-xs line-clamp-2 leading-relaxed
                        ${isSelected 
                          ? 'text-blue-700 dark:text-blue-200' 
                          : 'text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        {truncateText(result.description, 120)}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {searchResults.length >= 10 && (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing top 10 results. Type more to narrow down.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchIPInput;
