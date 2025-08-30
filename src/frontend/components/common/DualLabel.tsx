
interface DualLabel {
  top: string | undefined;
  bottom: string | undefined;
  mainLabel?: 'top' | 'bottom';
};

const DualLabel: React.FC<DualLabel> = ({ top, bottom, mainLabel = "bottom" }) => {

  const mainClassName = "text-gray-700 dark:text-white text-lg font-semibold";
  const secondaryClassName = "text-gray-500 dark:text-gray-400 text-sm";

  return (
    <div className={`grid grid-rows-[${mainLabel === "top" ? "3fr_2fr" : "2fr_3fr"}] place-items-start`}>
      <span className={`${mainLabel === "top" ? mainClassName : secondaryClassName}`}>{top}</span>
      <span className={`${mainLabel === "bottom" ? mainClassName : secondaryClassName}`}>{bottom}</span>
    </div>
  );
}

export default DualLabel;