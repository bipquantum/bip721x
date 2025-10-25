import { Principal } from "@dfinity/principal";
import { backendActor } from "../../actors/BackendActor";
import BipItem from "./BipItem";

interface PrivateBipItemProps {
  principal: Principal | undefined;
  intPropId: bigint;
  hideUnlisted?: boolean;
}

const PrivateBipItem: React.FC<PrivateBipItemProps> = ({
  intPropId,
  principal,
  hideUnlisted = false,
}) => {

  const { data: intProp } = backendActor.authenticated.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  return (
    intProp === undefined ? (
      <div
        className="text-center text-white"
        style={{
          padding: "100px",
        }}
      >
        Loading...
      </div>
    ) : "err" in intProp ? (
      <div>
        <h1>❌ Error</h1>
        <p>{"Cannot find IP"}</p>
      </div>
    ) : (
    <BipItem
      intProp={intProp.ok.intProp}
      intPropId={intPropId}
      principal={principal}
      hideUnlisted={hideUnlisted}
    />
    )
  );
};

export default PrivateBipItem;
