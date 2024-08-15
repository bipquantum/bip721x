import { backendActor } from "./actors/BackendActor"

const IPList = ({entries}) => {

    const { data: entries, loading } = backendActor.useQueryCall({
        functionName: "get_int_props",
        args: [{
            prev: [],
            take: [BigInt(10)],
        }],
    })

    return (
        <>
        {
            loading ? (
              <div className="text-center text-white" style={{ 
                padding: "100px"
               }}>Loading...</div>
            ) : entries.length > 0 ? (
              entries.map((entry, index) => ( 
            <div
              id="order_container"
              className="w-full  m-12 bg-white dark:bg-gray-800 p-8 shadow-lg rounded-lg max-w-8xl my-4  mx-auto"
            >

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-200">
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    CATEGORY
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {entry.category}{" "}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    PRICE
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    ${entry.price}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    IP License
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {" "}
                    {entry.ipLicense}{" "}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black dark:text-white">
                    Publishing date
                  </div>
                  <div className="text-lg font-bold text-black dark:text-white">
                    {" "}
                    {entry.publishingDate}{" "}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <div
                  id="product_details"
                  className="  p-6 rounded-lg flex justify-between items-center"
                >
                  <div className="flex flex-row items-center">
                    <div>
                      <h1 className="font-bold text-black dark:text-white text-2xl ">
                        {entry.title}{" "}
                      </h1>
                      <h3 className="text-xs  mt-1text-black dark:text-white ml-4 ">
                        {entry.description}{" "}
                      </h3>
                    </div>
                  </div>
                </div>                      
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">Author Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Family Name</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.familyName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Speciality</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorSpeciality}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{entry.authorAddress}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-lg font-semibold  text-black text-left ">
                Creation date<br/>
                {entry.creationDate}{" "}
              </div>
              <div className="text-lg font-semibold  text-blue-500 text-right ">
                Owner<br/>
                {entry.owner.toText()}{" "}
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center text-black dark:text-white" style={{ 
        padding: "100px"
        }}>
        Please add your First IP.
      </div>
    )
        }
        </>
      )

}

export default IPList