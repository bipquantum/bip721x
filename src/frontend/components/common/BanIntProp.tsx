import { Principal } from "@dfinity/principal";
import { backendActor } from "../actors/BackendActor";
import VioletButton from "./VioletButton";
import { TbBan } from "react-icons/tb";

interface BanIntPropProps {
  principal: Principal | undefined;
  intPropId: bigint;
}

const BanIntProp: React.FC<BanIntPropProps> = ({ principal, intPropId }) => {
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

  const { call: unbanIntProp, loading: unbanLoading } =
    backendActor.useUpdateCall({
      functionName: "unban_int_prop",
    });

  // Early return if data is not ready
  if (!principal || !admin || !moderators || isBanned === undefined)
    return null;

  const isAuthorized =
    principal === admin ||
    moderators.some((moderator) => moderator.compareTo(principal) === "eq");

  const handleClick = () => {
    const action = isBanned
      ? unbanIntProp([{ id: intPropId }])
      : banIntProp([{ id: intPropId, ban_author: false }]);

    action.then(() => getIsBanned());
  };

  if (!isAuthorized) return null;

  return (
    <VioletButton onClick={handleClick} isLoading={banLoading || unbanLoading}>
      <span className="flex flex-row items-center gap-x-1">
        <TbBan size={20} /> {isBanned ? "Unban" : "Ban"} BIP #
        {intPropId.toString()}
      </span>
    </VioletButton>
  );
};

export default BanIntProp;
