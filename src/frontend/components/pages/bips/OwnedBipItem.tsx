import { Link } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";

interface OwnedBipItemProps {
  intPropId: bigint;
}
const OwnedBipItem = ({ intPropId }: OwnedBipItemProps) => {
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  return (
    <>
      {intProp === undefined ? (
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
          <h1>Error</h1>
          <p>{"Cannot find IP"}</p>
        </div>
      ) : (
        <div className="flex text-lg">
          <Link className="w-1/3" to={`/bip/${intPropId}`}>
            {intProp.ok.V1.title}
          </Link>
          <Link className="w-1/3" to={`/bip/${intPropId}`}>
            {
              new Date(Number(intProp.ok.V1.creationDate.toString()))
                .toISOString()
                .split("T")[0]
            }
          </Link>
          <div className="w-1/3">
            <button className="rounded-lg bg-white px-3 py-1 text-sm text-blue-500">
              Download Certificate
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnedBipItem;
