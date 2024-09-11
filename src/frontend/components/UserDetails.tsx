import { fromNullable } from "@dfinity/utils";
import { backendActor } from "./actors/BackendActor";
import { Principal } from "@dfinity/principal";

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
    <div className="rounded-lg bg-gray-100 py-2 dark:bg-gray-700">
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
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                First Name
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {fromNullable(author)?.firstName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Nickname
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {fromNullable(author)?.nickName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Last Name
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {fromNullable(author)?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Specialty
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {fromNullable(author)?.specialty}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Country
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
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
