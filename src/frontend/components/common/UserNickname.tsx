import { fromNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../actors/BackendActor";

type UserNickNameArgs = {
  principal: Principal;
};

const UserNickName = ({ principal }: UserNickNameArgs) => {
  const { data: user } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [principal],
  });

  return (
    <span>
      {user === undefined || fromNullable(user) === undefined
        ? "Anonymous"
        : fromNullable(user)?.nickName}
    </span>
  );
};

export default UserNickName;
