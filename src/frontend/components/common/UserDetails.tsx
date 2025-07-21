import { fromNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../actors/BackendActor";

// @ts-ignore
import { getName } from "country-list";

type UserDetailsArgs = {
  principal: Principal;
};

const UserDetails = ({ principal }: UserDetailsArgs) => {
  const { data: author } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [principal],
  });

  return (
    <div className="relative w-full overflow-x-auto">
      {author === undefined || fromNullable(author) === undefined ? (
        <div className="text-center text-white">Anonymous</div>
      ) : (
        <table className="w-full text-left rtl:text-right">
          <tr>
            <th className="whitespace-nowrap font-medium text-white">
              First Name
            </th>
            <td className="text-right font-semibold">
              {fromNullable(author)?.firstName}
            </td>
          </tr>
          <tr>
            <th className="whitespace-nowrap font-medium text-white">
              Nickname
            </th>
            <td className="text-right font-semibold">
              {fromNullable(author)?.nickName}
            </td>
          </tr>
          <tr>
            <th className="whitespace-nowrap font-medium text-white">
              Last Name
            </th>
            <td className="text-right font-semibold">
              {fromNullable(author)?.lastName}
            </td>
          </tr>
          <tr>
            <th className="whitespace-nowrap font-medium text-white">
              Specialty
            </th>
            <td className="text-right font-semibold">
              {fromNullable(author)?.specialty}
            </td>
          </tr>
          <tr>
            <th className="whitespace-nowrap font-medium text-white">
              Country
            </th>
            <td className="text-right font-semibold">
              {getName(fromNullable(author)?.countryCode)}
            </td>
          </tr>
        </table>
      )}
    </div>
  );
};

export default UserDetails;
