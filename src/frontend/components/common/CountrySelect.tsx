import { useState, useEffect } from "react";
import { getData } from "country-list";

// Get all countries from country-list package and sort alphabetically
const COUNTRIES = getData().map(country => ({
  code: country.code,
  name: country.name
})).sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  className?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [selectedCountry, setSelectedCountry] = useState(value);

  useEffect(() => {
    setSelectedCountry(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    onChange(countryCode);
  };

  // Generate SVG icons for both light and dark themes
  const lightChevronSvg = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg fill="#6b7280" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>'
  )}")`;

  const darkChevronSvg = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg fill="#9ca3af" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>'
  )}")`;

  return (
    <select
      value={selectedCountry}
      onChange={handleChange}
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-black outline-none appearance-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className}`}
      style={{
        backgroundImage: `var(--chevron-icon, ${lightChevronSvg})`,
        backgroundPosition: "right 1rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "3rem",
      }}
      onFocus={(e) => {
        // Update CSS custom property based on dark mode
        const isDark = document.documentElement.classList.contains("dark");
        e.target.style.setProperty('--chevron-icon', isDark ? darkChevronSvg : lightChevronSvg);
      }}
    >
      <option value="" disabled className="text-gray-500 dark:text-gray-400">
        Select a country
      </option>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code} className="text-black dark:text-white bg-white dark:bg-gray-700">
          {country.name}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;