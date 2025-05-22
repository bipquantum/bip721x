import { Principal } from "@dfinity/principal";
import { backendActor } from "../actors/BackendActor";
import VioletButton from "./VioletButton";

interface BanIntPropProps {
  principal: Principal | undefined;
  intPropId: bigint;
};

const BanIntProp : React.FC<BanIntPropProps> = ({ principal, intPropId }) => {

  const { data: admin } = backendActor.useQueryCall({
    functionName: "get_admin",
    args: [],
  });

  const { data: moderators } = backendActor.useQueryCall({
    functionName: "get_moderators",
    args: [],
  });

  const { data: isBanned, call: getIsBanned } = backendActor.useQueryCall({
    functionName: "is_banned_int_prop",
    args: [{ id: intPropId }],
  });

  const { call: banIntProp, loading: banLoading } = backendActor.useUpdateCall({
    functionName: "ban_int_prop",
  });

  const { call: unbanIntProp, loading: unbanLoading } = backendActor.useUpdateCall({
    functionName: "unban_int_prop",
  });

  const triggerBan = () => {
    if (isBanned) {
      unbanIntProp([{ id: intPropId }]).then(() => getIsBanned());
    }
    else {
      banIntProp([{ id: intPropId, ban_author: false }]).then(() => getIsBanned());
    }
  }

  return (
    principal === undefined || admin === undefined || moderators === undefined || isBanned === undefined ? (
      <div
        className="text-center text-white"
        style={{
          padding: "100px",
        }}
      >
        Loading...
      </div>
    ) : principal === admin || moderators.find((moderator) => moderator.compareTo(principal) === "eq") ? (
      <VioletButton
        onClick={() => { triggerBan(); }}
        isLoading={banLoading || unbanLoading}
      >
        <span style={{ filter: isBanned ? 'grayscale(100%)' : '' }} >{`${isBanned ? "Unban" : "Ban"} 🚫`}</span>
      </VioletButton>
    ) : (
      <></>
    )
  )
}

export default BanIntProp;