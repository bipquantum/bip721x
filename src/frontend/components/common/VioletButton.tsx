import SpinnerSvg from "../../assets/spinner.svg";

interface VioletButtonProps {
  children: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
}

const VioletButton: React.FC<VioletButtonProps> = ({ children, isLoading, onClick }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-10 items-center justify-center rounded-lg bg-violet-700 px-4 py-2.5 min-w-[80px] text-sm font-medium text-white hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-300 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700 dark:focus:ring-violet-800"
      type="button"
      disabled={isLoading}
      style={{ position: 'relative' }}
    >
      <span className={isLoading ? "invisible" : ""}>{children}</span>
      {isLoading && <img src={SpinnerSvg} alt="Loading..." style={{ position: 'absolute' }} />}
    </button>
  );
};

export default VioletButton;
