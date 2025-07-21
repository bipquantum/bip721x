import { NUMBER_AIRDROP_IPS } from "../constants";

interface AirdropEligibleProps {
  intPropId: bigint;
  compact?: boolean;
}

const AirdropEligible: React.FC<AirdropEligibleProps> = ({
  intPropId,
  compact = false,
}) => {
  if (intPropId > NUMBER_AIRDROP_IPS) {
    return <></>;
  }

  return compact ? (
    <span>♛</span>
  ) : (
    <div className="flex flex-row items-center space-x-1 text-sm">
      <span className="italic text-blue-200">
        Qualified for the BIPQuantum Token Airdrop
      </span>
      <span>♛</span>
    </div>
  );
};

export default AirdropEligible;
