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
      {author === undefined || fromNullable(author) === undefined ? (
        <div
          className="text-center text-white"
          style={{
            padding: "100px",
          }}
        >
          Loading...
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {title && <p className="text-lg">{title}</p>}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div>
              <div className="text-sm font-semibold">First Name</div>
              <div className="text-lg font-bold">
                {fromNullable(author)?.firstName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Nickname</div>
              <div className="text-lg font-bold">
                {fromNullable(author)?.nickName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Last Name</div>
              <div className="text-lg font-bold">
                {fromNullable(author)?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Specialty</div>
              <div className="text-lg font-bold">
                {fromNullable(author)?.specialty}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Country</div>
              <div className="text-lg font-bold">
                {fromNullable(author)?.country}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
