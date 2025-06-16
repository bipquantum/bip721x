import SpinnerSvg from "../../assets/spinner.svg";

interface VioletButtonProps {
  children?: React.ReactNode;
  isLoading: boolean;
  type?: string;
  onClick: () => void;
}

const VioletButton: React.FC<VioletButtonProps> = ({ children, isLoading, onClick, type }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex text-base px-3 py-2 items-center justify-center rounded-lg bg-gradient-to-t  ${type === 'list' ? 'from-primary to-secondary' : type==='unlist' ? 'from-red-500 to-red-600' : type === 'buy' ? 'border-2 border-primary text-black dark:text-white' : type==='bid' ? 'border-2 border-red-500' : 'border-2 border-black dark:border-white text-black dark:text-white'} min-w-36`}
      type="button"
      disabled={isLoading}
      style={{ position: 'relative' }}
    >
      {isLoading && <img src={SpinnerSvg} alt="Loading..." style={{ position: 'absolute' }} />}
      <span className={isLoading ? "invisible" : ""}>{children}</span>
    </button>
  );
};

export default VioletButton;
