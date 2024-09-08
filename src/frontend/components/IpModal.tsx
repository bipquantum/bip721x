import { useState } from "react";
import Select from "react-tailwindcss-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-tailwindcss-select/dist/index.css";
import { NumericFormat } from "react-number-format";
import { useAuth } from "@ic-reactor/react";
import { backendActor } from "./actors/BackendActor";
import { IntPropInputWithPrice } from "../../declarations/backend/backend.did";
import {
  intPropLicenseToIndex,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  intPropLicenseFromIndex,
  intPropTypeToString,
  intPropLicenseToString,
  fromE8s,
  toE8s,
} from "../utils/conversions";
import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import FileUploader from "./FileUploader";

// TODO sardariuss 2024-AUG-28: Use for loop to generate options
const IP_TYPE_OPTIONS: Option[] = [
  {
    label: intPropTypeToString({ PATENT: null }),
    value: intPropTypeToIndex({ PATENT: null }).toString(),
  },
  {
    label: intPropTypeToString({ IP_CERTIFICATE: null }),
    value: intPropTypeToIndex({ IP_CERTIFICATE: null }).toString(),
  },
  {
    label: intPropTypeToString({ COPYRIGHT: null }),
    value: intPropTypeToIndex({ COPYRIGHT: null }).toString(),
  },
];

// TODO sardariuss 2024-AUG-28: Use for loop to generate options
const IP_LICENSE_OPTIONS: Option[] = [
  {
    label: intPropLicenseToString({ GAME_FI: null }),
    value: intPropLicenseToIndex({ GAME_FI: null }).toString(),
  },
  {
    label: intPropLicenseToString({ SAAS: null }),
    value: intPropLicenseToIndex({ SAAS: null }).toString(),
  },
  {
    label: intPropLicenseToString({ ADVERTISEMENT: null }),
    value: intPropLicenseToIndex({ ADVERTISEMENT: null }).toString(),
  },
  {
    label: intPropLicenseToString({ META_USE: null }),
    value: intPropLicenseToIndex({ META_USE: null }).toString(),
  },
  {
    label: intPropLicenseToString({ REPRODUCTION: null }),
    value: intPropLicenseToIndex({ REPRODUCTION: null }).toString(),
  },
  {
    label: intPropLicenseToString({ PHYSICAL_REPRODUCTION: null }),
    value: intPropLicenseToIndex({ PHYSICAL_REPRODUCTION: null }).toString(),
  },
  {
    label: intPropLicenseToString({ NOT_APPLICABLE: null }),
    value: intPropLicenseToIndex({ NOT_APPLICABLE: null }).toString(),
  },
];

const INITIAL_INT_PROP_INPUT: IntPropInputWithPrice = {
  dataUri: "",
  title: "",
  e8sIcpPrice: BigInt(10_000_000_000), // 100 ICP
  intPropLicense: { NOT_APPLICABLE: null },
  intPropType: { PATENT: null },
  description: "",
  creationDate: BigInt(new Date().getTime()),
};

type IpModalProps = {
  isModalOpen: boolean;
  toggleModal: () => void;
};

function IpModal({ isModalOpen, toggleModal }: IpModalProps) {

  const { identity, authenticated } = useAuth({});

  if (!authenticated || !identity) {
    return <></>;
  }

  const [intPropInput, setIntPropInput] = useState<IntPropInputWithPrice>(
    INITIAL_INT_PROP_INPUT
  );

  const { call: createIntProp } = backendActor.useUpdateCall({
    functionName: "create_int_prop",
    onSuccess: (data) => {
      if (data === undefined) {
        toast.error("Failed to create new IP: no data returned");
      } else if ("err" in data) {
        toast.error("Failed to create new IP: " + data["err"]);
      } else {
        toast.success("Created new IP (identifier=" + data["ok"] + ")");
      }
      toggleModal();
    },
    onError: (error) => {
      toast.error("Failed to create new IP: " + error);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Call your function to create the IP entry
    createIntProp([intPropInput]);
  };

  return (
    <>
      <div
        id="crud-modal"
        tabIndex={-1}
        aria-hidden={!isModalOpen}
        className={`${
          isModalOpen ? "flex" : "hidden"
        } fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New IP
              </h3>
              <button
                type="button"
                onClick={toggleModal}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
              className="p-4 md:p-5"
            >
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div key="title" className="col-span-2">
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter title here"
                    value={intPropInput.title}
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        title: e.target.value,
                      });
                    }}
                  ></input>
                </div>
                <div key="description" className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    name="description"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter description here"
                    value={intPropInput.description}
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        description: e.target.value,
                      });
                    }}
                  ></textarea>
                </div>
                <div key="e8sIcpPrice" className="col-span-2">
                  <label
                    htmlFor="e8sIcpPrice"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Price (ICP)
                  </label>
                  <NumericFormat
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    thousandSeparator=","
                    decimalScale={2}
                    value={fromE8s(intPropInput.e8sIcpPrice)}
                    onValueChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        e8sIcpPrice: toE8s(
                          parseFloat(e.value.replace(/,/g, ""))
                        ),
                      });
                      console.log(intPropInput);
                    }}
                  />
                </div>
                <div key="ipType" className="sm:col-span-2">
                  <label
                    htmlFor="ipType"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    IP Type
                  </label>
                  <Select
                    value={
                      IP_TYPE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropTypeToIndex(
                            intPropInput.intPropType
                          ).toString()
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropType: ${intPropInput.intPropType}`
                        );
                      })()
                    }
                    onChange={(selectedOptions: SelectValue) =>
                      setIntPropInput({
                        ...intPropInput,
                        intPropType: intPropTypeFromIndex(
                          Number((selectedOptions as Option).value)
                        ),
                      })
                    }
                    options={IP_TYPE_OPTIONS}
                    placeholder="Select an option"
                    noOptionsMessage="No options found"
                    primaryColor="#ffffff"
                  />
                </div>
                <div key="ipLicense" className="sm:col-span-2">
                  <label
                    htmlFor="ipLicense"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    IP License
                  </label>
                  <Select
                    value={
                      IP_LICENSE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropLicenseToIndex(
                            intPropInput.intPropLicense
                          ).toString()
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropType: ${intPropInput.intPropLicense}`
                        );
                      })()
                    }
                    onChange={(selectedOptions: SelectValue) =>
                      setIntPropInput({
                        ...intPropInput,
                        intPropLicense: intPropLicenseFromIndex(
                          Number((selectedOptions as Option).value)
                        ),
                      })
                    }
                    options={IP_LICENSE_OPTIONS}
                    placeholder="Select an option"
                    noOptionsMessage="No options found"
                    primaryColor="#ffffff"
                  />
                </div>
                <div key="creationDate" className="col-span-2">
                  <label
                    htmlFor="creationDate"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Creation Date
                  </label>
                  <input
                    type="date"
                    id="creationDate"
                    name="creationDate"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={
                      new Date(Number(intPropInput.creationDate))
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        creationDate: BigInt(
                          new Date(e.target.value).getTime()
                        ),
                      });
                    }}
                  />
                </div>
                <div key="ipImage" className="col-span-2">
                  <label
                    htmlFor="ipImage"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Upload Image
                  </label>
                  <FileUploader dataUri={intPropInput.dataUri} setDataUri={(dataUri) => {
                      setIntPropInput({
                        ...intPropInput,
                        dataUri: dataUri?? "",
                      });
                    }
                  } />
                </div>
                <button
                  type="submit"
                  className="w-30 text-white inline-flex bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Submit IP
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default IpModal;
