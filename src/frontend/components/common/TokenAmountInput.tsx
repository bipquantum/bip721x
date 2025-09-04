import React from "react";

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tokenSymbol?: string;
  usdValue?: string;
  maxValue?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  tokenSymbol,
  usdValue,
  maxValue,
  label,
  className,
  disabled = false,
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string, numbers with decimal points, and leading zeros
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      if (inputValue === "") {
        onChange(inputValue);
      } else {
        const numericValue = parseFloat(inputValue);
        
        // If maxValue is provided and the entered amount exceeds it, cap it at maxValue
        if (maxValue !== undefined && numericValue > maxValue) {
          onChange(maxValue.toString());
        } else {
          onChange(inputValue);
        }
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleAmountChange}
          placeholder={placeholder}
          disabled={disabled}
          className={
            className ||
            "w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800"
          }
        />
        {tokenSymbol && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            {tokenSymbol}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {usdValue || '≈ $0.00'}
      </p>
    </div>
  );
};

export default TokenAmountInput;