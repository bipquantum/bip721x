import { NUMBER_AIRDROP_IPS } from "../constants";

interface AirdropEligibleProps {
  intPropId: bigint;
  compact?: boolean;
};

const AirdropEligible : React.FC<AirdropEligibleProps> = ({ intPropId, compact = false }) => {

  if (intPropId > NUMBER_AIRDROP_IPS) {
    return <></>
  };

  return (
    compact? <span>♛</span> :
    <div className="text-sm flex flex-row space-x-1 items-center">
      <span className="text-blue-200 italic">Qualified for the BIPQuantum Token Airdrop</span>
      <span>♛</span>
    </div>
  );
}

export default AirdropEligible;