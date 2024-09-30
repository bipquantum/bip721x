import { fromNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../actors/BackendActor";

type UserDetailsArgs = {
  principal: Principal;
  title?: string;
};

const UserDetails = ({ principal, title }: UserDetailsArgs) => {
  const { data: author } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [principal],
  });

  return (
    <div className="rounded-lg border border-gray-300 p-2">
      <div className="flex flex-col gap-2">
        {title && <p>{title}</p>}
        {author === undefined || fromNullable(author) === undefined ? (
          <div className="text-center text-white">Anonymous</div>
        ) : (
          <div className="grid grid-cols-2 gap-1 md:grid-cols-5">
            <div>
              <p>First Name</p>
              <div className="font-bold">{fromNullable(author)?.firstName}</div>
            </div>
            <div>
              <p>Nickname</p>
              <div className="font-bold">{fromNullable(author)?.nickName}</div>
            </div>
            <div>
              <p>Last Name</p>
              <div className="font-bold">{fromNullable(author)?.lastName}</div>
            </div>
            <div>
              <p>Specialty</p>
              <div className="font-bold">{fromNullable(author)?.specialty}</div>
            </div>
            <div>
              <p>Country</p>
              <div className="font-bold">{fromNullable(author)?.country}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
