import { createContext, useContext, useState, useEffect } from "react";

interface CookieBannerContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const CookieBannerContext = createContext<
  CookieBannerContextType | undefined
>(undefined);

export const CookieBannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState<boolean>(() => {
    // Retrieve the saved visibility state from localStorage on initial render
    const savedVisibility = localStorage.getItem("cookieBannerVisible");
    return savedVisibility !== "false"; // Default to true if no value is stored
  });

  // Update localStorage whenever `visible` changes
  useEffect(() => {
    localStorage.setItem("cookieBannerVisible", String(visible));
  }, [visible]);

  return (
    <CookieBannerContext.Provider value={{ visible, setVisible }}>
      {children}
    </CookieBannerContext.Provider>
  );
};

export const useCookieBanner = (): CookieBannerContextType => {
  const context = useContext(CookieBannerContext);
  if (context === undefined) {
    throw new Error(
      "useCookieBanner must be used within a CookieBannerProvider",
    );
  }
  return context;
};

const CookieBanner = () => {
  const { visible, setVisible } = useCookieBanner();

  return (
    visible && (
      <div
        id="cookie-banner"
        tabIndex={-1}
        className="fixed start-0 top-0 z-50 flex w-full items-center justify-between gap-2 bg-gray-800/95 px-3 py-3 backdrop-blur dark:bg-gray-200/95 sm:px-4"
      >
        <div className="flex flex-1 items-center">
          <p className="text-xs text-gray-200 dark:text-gray-800 sm:text-sm">
            We use cookies for analytics and to improve your experience. By
            continuing, you accept our use of cookies.
          </p>
        </div>
        <button
          data-dismiss-target="#cookie-banner"
          type="button"
          className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-gray-300 hover:text-white dark:text-gray-700 dark:hover:text-gray-900"
          onClick={() => setVisible(false)}
          aria-label="Close cookie banner"
        >
          <svg
            className="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    )
  );
};

export default CookieBanner;
