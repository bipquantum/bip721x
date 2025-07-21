import { Principal } from "@dfinity/principal";
import { backendActor } from "../actors/BackendActor";
import VioletButton from "./VioletButton";
import { TbBan } from "react-icons/tb";

interface BanAuthorProps {
  principal: Principal | undefined;
  author: Principal;
}

const BanAuthor: React.FC<BanAuthorProps> = ({ principal, author }) => {
  const { data: admin } = backendActor.useQueryCall({
    functionName: "get_admin",
    args: [],
  });

  const { data: moderators } = backendActor.useQueryCall({
    functionName: "get_moderators",
    args: [],
  });

  const { data: isBanned, call: getIsBanned } = backendActor.useQueryCall({
    functionName: "is_banned_author",
    args: [{ author }],
  });

  const { call: banAuthor, loading: banLoading } = backendActor.useUpdateCall({
    functionName: "ban_author",
  });

  const { call: unbanAuthor, loading: unbanLoading } =
    backendActor.useUpdateCall({
      functionName: "unban_author",
    });

  // Early return if data is not ready
  if (!principal || !admin || !moderators || isBanned === undefined)
    return null;

  const isAuthorized =
    principal === admin ||
    moderators.some((moderator) => moderator.compareTo(principal) === "eq");

  const handleClick = () => {
    const action = isBanned
      ? unbanAuthor([{ author }])
      : banAuthor([{ author }]);

    action.then(() => getIsBanned());
  };

  if (!isAuthorized) return null;

  return (
    <VioletButton onClick={handleClick} isLoading={banLoading || unbanLoading}>
      <span className="flex flex-row items-center gap-x-1">
        <TbBan size={20} /> {isBanned ? "Unban" : "Ban"} author
      </span>
    </VioletButton>
  );
};

export default BanAuthor;
