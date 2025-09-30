// Custom styles for React Select components
export const getCustomStyles = (isDark: boolean) => ({
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    fontSize: "16px",
    color: isDark ? "#ffffff" : "#000000",
    minHeight: "auto",
    "&:hover": {
      border: "none",
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: isDark ? "#ffffff" : "#000000",
  }),
  input: (provided: any) => ({
    ...provided,
    color: isDark ? "#ffffff" : "#000000",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: isDark ? "#9ca3af" : "#6b7280",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: isDark ? "#374151" : "#ffffff",
    border: isDark ? "1px solid #4b5563" : "1px solid #d1d5db",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? isDark
        ? "#4f46e5"
        : "#3b82f6"
      : state.isFocused
      ? isDark
        ? "#4b5563"
        : "#f3f4f6"
      : "transparent",
    color: state.isSelected
      ? "#ffffff"
      : isDark
      ? "#ffffff"
      : "#000000",
    "&:hover": {
      backgroundColor: state.isSelected
        ? isDark
          ? "#4f46e5"
          : "#3b82f6"
        : isDark
        ? "#4b5563"
        : "#f3f4f6",
    },
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: isDark ? "#ffffff" : "#000000",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: isDark ? "#ffffff" : "#000000",
    "&:hover": {
      backgroundColor: isDark ? "#ef4444" : "#dc2626",
      color: "#ffffff",
    },
  }),
});