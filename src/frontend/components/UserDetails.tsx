import { fromNullable } from "@dfinity/utils"
import { backendActor } from "./actors/BackendActor"
import { Principal } from "@dfinity/principal"

type UserDetailsArgs = {
  principal: Principal,
}

const UserDetails = ({ principal }: UserDetailsArgs) => {

  const { data: author } = backendActor.useQueryCall({
    functionName: "get_user",
    args: [principal]
  })

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
      {
        author === undefined || fromNullable(author) === undefined ? (
          <div className="text-center text-white" style={{ 
            padding: "100px"
            }}>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">First Name</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(author)?.firstName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nickname</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(author)?.nickName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Last Name</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(author)?.lastName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Specialty</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(author)?.specialty}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Country</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(author)?.country}</div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default UserDetails