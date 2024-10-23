import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import { useState } from "react";
import { formatDate, timeToDate } from "../../../utils/conversions";
import GenerateCertificate from "../bips/GenerateCertificate";
import ListingDetails from "../../common/ListingDetails";
import SpinnerSvg from "../../../assets/spinner.svg";
import { Link } from "react-router-dom";

interface BIPDetailsProps {
  id: bigint;
  principal: Principal;
}

const BIPDetail: React.FC<BIPDetailsProps> = ({ id, principal }) => {
  
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: id }],
  });

  if (intProp === undefined || 'ok' in intProp === false) {
    return <img src={SpinnerSvg} alt="Loading..." />
  }

  return (
    <div className="flex grid grid-cols-9 gap-2 sm:p-8 shadow hover:border-2 border-secondary bg-tertiary sm:rounded-lg text-white mx-3 my-1 items-center">
      <Link className="col-span-2 text-xl" to={`/bip/${id.toString()}`}>{intProp.ok.V1.title}</Link>
      <Link className="col-span-2"  to={`/bip/${id.toString()}`}>{formatDate(timeToDate(intProp.ok.V1.creationDate))}</Link>
      <div className="col-span-2">
        <GenerateCertificate intPropId={id.toString()} intProp={intProp.ok.V1}/>
      </div>
      <div className="col-span-3 self-end justify-self-end">
        <ListingDetails principal={principal} owner={principal} intPropId={id} updateBipDetails={() => {}} />
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

  const [prev, setPrev] = useState<[] | [bigint]>([]); // Keep track of previous entries
  
  const { data: BIPs } = backendActor.useQueryCall({
    functionName: "get_int_props_of",
    args: [{ owner: principal, prev, take }],
  });
 
  return (
    <div className="flex w-full flex-1 flex-col items-center bg-white gap-y-4 overflow-y-auto py-4 text-black sm:items-start sm:p-0 grow">
      <div className="flex flex-col text-center items-center justify-center w-full mt-5 text-2xl font-bold tracking-wider sm:py-16 sm:text-start sm:text-[32px]">
        Your bIPs
        <div className="h-1 w-32 bg-primary sm:w-96"></div>
      </div>
      <ul className="flex flex-col w-full grow">
        {
          BIPs && BIPs.map((bip: any) => (
            <li key={bip}>
              <BIPDetail id={bip} principal={principal}/>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Wallet;