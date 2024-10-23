import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { backendActor } from "../../actors/BackendActor";
import {
  fromE8s,
  intPropLicenseToString,
  intPropTypeToString,
} from "../../../utils/conversions";
import FilePreview from "../../common/FilePreview";

import FavoriteHeartOutlineSvg from "../../../assets/favourite-heart-outline.svg";
import AIBotImg from "../../../assets/ai-bot.png";
import { ICP_DECIMALS_ALLOWED } from "../../constants";

interface IPItemProps {
  intPropId: bigint;
}

const BipItem: React.FC<IPItemProps> = ({ intPropId }) => {
  const [price, setPrice] = useState("");
  const { data: intProp } = backendActor.useQueryCall({
    functionName: "get_int_prop",
    args: [{ token_id: intPropId }],
  });

  const { data: e8sPrice } = backendActor.useQueryCall({
    functionName: "get_e8s_price",
    args: [{ token_id: intPropId }],
  });

  useEffect(() => {
    if (e8sPrice && "ok" in e8sPrice) {
      const price = fromE8s(e8sPrice.ok).toFixed(ICP_DECIMALS_ALLOWED);
      setPrice(price);
    } else setPrice("");
  }, [e8sPrice]);

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
        <Link className="w-44 sm:w-72 sm:p-2" to={`/bip/${intPropId}`}>
          <div className="bg-tertiary flex flex-col gap-y-1 rounded-2xl p-3 text-base text-white sm:p-4">
            {intProp.ok.V1.dataUri ? (
              <div className="w-full">
                <FilePreview
                  dataUri={intProp.ok.V1.dataUri}
                  className="h-[111px] w-full rounded-xl object-cover sm:h-[184px]"
                />
              </div>
            ) : (
              <img
                src={AIBotImg}
                className="mb-2 h-[111px] w-full rounded-xl border border-gray-300 object-cover shadow-md sm:h-[184px]"
                alt="Logo"
              />
            )}
            <div className="flex items-center justify-between font-semibold">
              <p className="text-base sm:text-2xl">{intProp.ok.V1.title}</p>
              <button className="rounded-full bg-[#6d15ff] px-4 py-1 text-xs sm:text-sm">
                Buy
              </button>
            </div>
            <p className="text-sm font-semibold sm:text-base">
              Type: {intPropTypeToString(intProp.ok.V1.intPropType)}
            </p>
            {
              intProp.ok.V1.intPropLicenses.length > 0 && 
              <p className="text-sm font-semibold sm:text-base">
                Licenses: {intProp.ok.V1.intPropLicenses.map(intPropLicenseToString).join(", ")}
              </p>
            }
            <div className="flex items-center justify-between text-lg font-bold sm:text-[22px]">
              {price !== "" ? (
                <div className="font-bold">{price} ICP</div>
              ) : (
                <div></div>
              )}
              <button>
                <img
                  src={FavoriteHeartOutlineSvg}
                  className="h-4 w-4 sm:h-8 sm:w-8"
                  alt="Logo"
                />
              </button>
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default BipItem;
