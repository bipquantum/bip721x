import { fromNullable } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";

import { backendActor } from "../actors/BackendActor";

// @ts-ignore
import { getName } from "country-list";
import { useMemo } from "react";
import { fromNullableExt } from "../../utils/conversions";

type UserDetailsArgs = {
  principal: Principal;
};

const UserDetails = ({ principal }: UserDetailsArgs) => {
  
  const { data: author } = backendActor.unauthenticated.useQueryCall({
    functionName: "get_user",
    args: [principal],
  });

  const countryCode = useMemo(() => {
    return fromNullableExt(author)?.countryCode;
  }, [author]);

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
              {countryCode ? getName(countryCode) : 'N/A'}
            </td>
          </tr>
        </table>
      )}
    </div>
  );
};

export default UserDetails;
