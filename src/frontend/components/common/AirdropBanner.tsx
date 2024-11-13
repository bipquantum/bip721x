import { createContext, useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NUMBER_AIRDROP_IPS } from "../constants";

interface AirdropBannerContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const AirdropBannerContext = createContext<AirdropBannerContextType | undefined>(undefined);

export const AirdropBannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    throw new Error("useAirdropBanner must be used within an AirdropBannerProvider");
  }
  return context;
};


const AirdropBanner = () => {

  const { visible, setVisible } = useAirdropBanner();

  return (
    visible && <div id="sticky-banner" tabIndex={-1} className="fixed top-0 start-0 z-50 flex justify-between w-full p-4 border-b border-secondary bg-tertiary">
        <div className="text-sm font-normal text-white flex items-center mx-auto">
          <Link to={"/marketplace"} className="text-lg hover:text-white text-gray-200 flex flex-col sm:flex-row items-center sm:space-x-2" onClick={() => setVisible(false)}>
            <span className="flex items-center justify-center sm:justify-start">
              <span>Be Among the First!</span>
              <span className="animate-wiggle ml-2">🚀</span> {/* Added margin for spacing */}
            </span>
            <span className="text-center sm:text-left">{`The First ${NUMBER_AIRDROP_IPS.toLocaleString()} IPs Minted Qualify for the bIPQuantum Token Airdrop!`}</span>
          </Link>
        </div>
      <div className="flex items-center">
        <button 
          data-dismiss-target="#sticky-banner" 
          type="button"
          className="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-200 hover:text-white rounded-lg text-sm p-1.5"
          onClick={() => setVisible(false)}>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AirdropBanner;