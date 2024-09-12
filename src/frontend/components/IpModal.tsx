import { useState } from "react";
import Select from "react-tailwindcss-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-tailwindcss-select/dist/index.css";
import { useAuth } from "@ic-reactor/react";
import { backendActor } from "./actors/BackendActor";
import { IntPropInput } from "../../declarations/backend/backend.did";
import {
  intPropLicenseToIndex,
  intPropTypeFromIndex,
  intPropTypeToIndex,
  intPropLicenseFromIndex,
  intPropTypeToString,
  intPropLicenseToString,
} from "../utils/conversions";
import {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import FileUploader from "./common/FileUploader";

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

const INITIAL_INT_PROP_INPUT: IntPropInput = {
  dataUri: "",
  title: "",
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

  const [intPropInput, setIntPropInput] = useState<IntPropInput>(
    INITIAL_INT_PROP_INPUT,
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
        } fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0`}
      >
        <div className="relative max-h-full w-full max-w-md p-4">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600 md:p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New IP
              </h3>
              <button
                type="button"
                onClick={toggleModal}
                className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 14 14">
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
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div key="title" className="col-span-2">
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    name="description"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
                <div key="ipType" className="sm:col-span-2">
                  <label
                    htmlFor="ipType"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    IP Type
                  </label>
                  <Select
                    value={
                      IP_TYPE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropTypeToIndex(
                            intPropInput.intPropType,
                          ).toString(),
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropType: ${intPropInput.intPropType}`,
                        );
                      })()
                    }
                    onChange={(selectedOptions: SelectValue) =>
                      setIntPropInput({
                        ...intPropInput,
                        intPropType: intPropTypeFromIndex(
                          Number((selectedOptions as Option).value),
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
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    IP License
                  </label>
                  <Select
                    value={
                      IP_LICENSE_OPTIONS.find(
                        (option) =>
                          option.value ===
                          intPropLicenseToIndex(
                            intPropInput.intPropLicense,
                          ).toString(),
                      ) ||
                      (() => {
                        throw new Error(
                          `Invalid intPropType: ${intPropInput.intPropLicense}`,
                        );
                      })()
                    }
                    onChange={(selectedOptions: SelectValue) =>
                      setIntPropInput({
                        ...intPropInput,
                        intPropLicense: intPropLicenseFromIndex(
                          Number((selectedOptions as Option).value),
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
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Creation Date
                  </label>
                  <input
                    type="date"
                    id="creationDate"
                    name="creationDate"
                    className="focus:ring-primary-600 focus:border-primary-600 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={
                      new Date(Number(intPropInput.creationDate))
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      setIntPropInput({
                        ...intPropInput,
                        creationDate: BigInt(
                          new Date(e.target.value).getTime(),
                        ),
                      });
                    }}
                  />
                </div>
                <div key="ipImage" className="col-span-2">
                  <label
                    htmlFor="ipImage"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Upload Image
                  </label>
                  <FileUploader
                    dataUri={intPropInput.dataUri}
                    setDataUri={(dataUri) => {
                      setIntPropInput({
                        ...intPropInput,
                        dataUri: dataUri ?? "",
                      });
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-30 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
