import { fromE8s } from "../utils/conversions";
import { backendActor } from "./actors/BackendActor";

type IPPriceProps = {
  intPropId: bigint;
}

const IPPrice = ({intPropId} : IPPriceProps) => {

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{token_id: intPropId}],
  })

  return (
    <div>
      <div className="text-sm font-semibold text-black dark:text-white">
        PRICE
      </div>
      <div>
      {
        e8sPrice === undefined ? (
          <div className="text-center text-white" style={{ 
            padding: "100px"
            }}>Loading...</div>
        ) : 'err' in e8sPrice ? (
          <div>
            <h1>Error</h1>
            <p>{e8sPrice.err}</p>
          </div>
        ) : 
          <div className="text-lg font-bold text-green-400">
            ICP { fromE8s(e8sPrice.ok).toFixed(2) }
          </div>
      }
      </div>
    </div>
  );
}

export default IPPrice;
