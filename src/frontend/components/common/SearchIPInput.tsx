import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearch } from "./SearchContext";
import { Link } from "react-router-dom";
import { MdSearch } from "react-icons/md";

const SearchIPInput = () => {
  const { miniSearch } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");

  const searchResults = useMemo(
    () => miniSearch.search(query),
    [miniSearch, query],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults || searchResults.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1,
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0) {
          // Navigate to selected result
          window.location.href = `/bip/${searchResults[selectedIndex].id}`;
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setInputValue("");
    setSelectedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="relative flex flex-col">
      <div className="group flex w-full items-center justify-start rounded-2xl border-opacity-40 bg-white px-4 dark:bg-white/10 sm:w-[320px]">
        <MdSearch className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search BIP"
          className="w-full rounded-lg bg-transparent px-2 py-2 text-gray-900 outline-none dark:text-white"
        />
      </div>

      {isOpen && searchResults && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-background shadow-xl dark:border-gray-600 dark:bg-background-dark"
        >
          <div className="border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-white/10">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} found
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
                    className={`flex flex-col p-4 transition-colors duration-150 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-white dark:hover:bg-white/10"
                    } `}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <h3
                        className={`line-clamp-1 text-sm font-medium ${
                          isSelected
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white"
                        } `}
                      >
                        {truncateText(result.title, 50)}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          isSelected
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        } `}
                      >
                        BIP #{result.id}
                      </span>
                    </div>

                    {result.description && (
                      <p
                        className={`line-clamp-2 text-xs leading-relaxed ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-200"
                            : "text-gray-600 dark:text-gray-400"
                        } `}
                      >
                        {truncateText(result.description, 120)}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {searchResults.length >= 10 && (
            <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing top 10 results. Type more to narrow down.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchIPInput;
