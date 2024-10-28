import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import { formatDate, timeToDate } from "../../../utils/conversions";
import GenerateCertificate from "../bips/GenerateCertificate";
import ListingDetails from "../../common/ListingDetails";
import SpinnerSvg from "../../../assets/spinner.svg";
import { Link } from "react-router-dom";
import { toNullable } from "@dfinity/utils";
import BipList from "../bips/BipList";

interface BIPDetailsProps {
  intPropId: bigint;
  principal: Principal;
}

const BIPDetail: React.FC<BIPDetailsProps> = ({ intPropId, principal }) => {
  
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  if (intProp === undefined || 'ok' in intProp === false) {
    return <img src={SpinnerSvg} alt="Loading..." />
  }

  return (
    <div className="flex grid grid-cols-9 gap-2 sm:p-8 shadow border-2 border-tertiary hover:border-primary bg-tertiary sm:rounded-lg text-white mx-3 my-1 items-center">
      <Link className="col-span-2 text-xl" to={`/bip/${intPropId.toString()}`}>{intProp.ok.V1.title}</Link>
      <Link className="col-span-2"  to={`/bip/${intPropId.toString()}`}>{formatDate(timeToDate(intProp.ok.V1.creationDate))}</Link>
      <div className="col-span-2">
        <GenerateCertificate intPropId={intPropId.toString()} intProp={intProp.ok.V1}/>
      </div>
      <div className="col-span-3 self-end justify-self-end">
        <ListingDetails principal={principal} owner={principal} intPropId={intPropId} updateBipDetails={() => {}} />
      </div>
    </div>
  );
};

interface WalletProps {
  principal: Principal | undefined;
}

const take: [] | [bigint] = [BigInt(5)];

const Wallet = ({ principal }: WalletProps) => {

  if (principal === undefined) {
    console.error("Principal is undefined");
    return <img src={SpinnerSvg} alt="Loading..." />
  }
  
  const { call: getIntPropsOf } = backendActor.useQueryCall({
    functionName: "get_int_props_of",
  });

  const fetchBips = async (prev: bigint | undefined) => {
    return await getIntPropsOf([{ owner: principal, prev: toNullable(prev), take }]);
  }
 
  return (
    <div className="flex w-full flex-1 flex-col items-center bg-white gap-y-4 overflow-y-auto py-4 text-black sm:items-start sm:p-0 grow">
      <div className="flex flex-col text-center items-center justify-center w-full mt-5 text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
        Your bIPs
        <div className="h-1 w-32 bg-primary sm:w-96"></div>
      </div>
      <BipList principal={principal} fetchBips={fetchBips} BipItemComponent={BIPDetail} scrollableClassName="flex flex-col w-full grow"/>
    </div>
  );
}

export default Wallet;