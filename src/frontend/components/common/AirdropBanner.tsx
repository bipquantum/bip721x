import { createContext, useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NUMBER_AIRDROP_IPS } from "../constants";

interface AirdropBannerContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const AirdropBannerContext = createContext<
  AirdropBannerContextType | undefined
>(undefined);

export const AirdropBannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState<boolean>(() => {
    // Retrieve the saved visibility state from localStorage on initial render
    const savedVisibility = localStorage.getItem("airdropBannerVisible");
    return savedVisibility !== "false"; // Default to true if no value is stored
  });

  // Update localStorage whenever `visible` changes
  useEffect(() => {
    localStorage.setItem("airdropBannerVisible", String(visible));
  }, [visible]);

  return (
    <AirdropBannerContext.Provider value={{ visible, setVisible }}>
      {children}
    </AirdropBannerContext.Provider>
  );
};

export const useAirdropBanner = (): AirdropBannerContextType => {
  const context = useContext(AirdropBannerContext);
  if (context === undefined) {
    throw new Error(
      "useAirdropBanner must be used within an AirdropBannerProvider",
    );
  }
  return context;
};

const AirdropBanner = () => {
  const { visible, setVisible } = useAirdropBanner();

  return (
    visible && (
      <div
        id="sticky-banner"
        tabIndex={-1}
        className="fixed start-0 top-0 z-50 flex w-full justify-between bg-background/60 p-6 backdrop-blur dark:bg-background-dark/60"
      >
        <div className="mx-auto flex items-center text-sm font-normal text-white">
          <Link
            to={"/marketplace"}
            className="flex flex-col items-center text-lg text-gray-200 hover:text-white sm:flex-row sm:space-x-2"
            onClick={() => setVisible(false)}
          >
            <span className="flex items-center justify-center sm:justify-start">
              <span>Be Among the First!</span>
              <span className="ml-2 animate-wiggle">🥇</span>{" "}
              {/* Added margin for spacing */}
            </span>
            <span className="text-center sm:text-left">{`The First ${NUMBER_AIRDROP_IPS.toLocaleString()} IPs Minted Qualify for the BIPQuantum Token Airdrop!`}</span>
          </Link>
        </div>
        <div className="flex items-center">
          <button
            data-dismiss-target="#sticky-banner"
            type="button"
            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-sm text-gray-200 hover:text-white"
            onClick={() => setVisible(false)}
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
      </div>
    )
  );
};

export default AirdropBanner;
