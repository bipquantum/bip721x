import { fromNullable } from "@dfinity/utils"
import { backendActor } from "./actors/BackendActor"

type IPAuthorArgs = {
  intPropId: bigint,
}

const IPAuthor = ({ intPropId }: IPAuthorArgs) => {

  const { data: owners } = backendActor.useQueryCall({
    functionName: "owners_of",
    args: [{
      token_ids: [intPropId],
    }],
  })

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Author Details</h3>
      {
        owners === undefined ? (
          <div className="text-center text-white" style={{ 
            padding: "100px"
            }}>Loading...</div>
        ) : owners.length !== 1 || fromNullable(owners[0]) === undefined ? (
          <div>
            <h1>Error</h1>
            <p>{"Cannot find owner"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">First Name</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(owners[0])?.[1].firstName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nickname</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(owners[0])?.[1].nickName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Last Name</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(owners[0])?.[1].lastName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Speciality</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(owners[0])?.[1].speciality}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Country</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{fromNullable(owners[0])?.[1].country}</div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default IPAuthor