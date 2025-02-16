import { SetStateAction, useState } from "react";
import { Principal } from "@dfinity/principal";

import NewIP from "./NewIp";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../layout/ChatHistoryContext";
import FilePreview from "../../common/FilePreview";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { components } from "react-select";

import { CiImageOn } from "react-icons/ci";
import {
  TbArrowLeft,
  TbArrowRight,
  TbCalendarEventFilled,
  TbCheck,
} from "react-icons/tb";
import ReactCountryDropdown from "react-country-dropdown";

interface NewIPButtonProps {
  principal: Principal | undefined;
}

// Custom Syles For React Select Dropdown
const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    fontSize: "16px",
    padding: "10px",
    color: "#fff",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#171717",
    borderRadius: "12px",
    padding: "5px 0",
    fontSize: "16px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundImage: state.isSelected
      ? "linear-gradient(90deg, #4a90e2, #005bea)"
      : state.isFocused
        ? "linear-gradient(90deg, #4a90e2, #005bea)"
        : "none",
    backgroundColor:
      state.isSelected || state.isFocused ? "transparent" : "#171717",
    color: "#fff",
    padding: "10px",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#aaa",
  }),
};

// Custom Multi-Select Checkbox Component
const CustomMultiValue = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-3 h-4 w-4"
      />
      {props.label}
    </components.Option>
  );
};

const NewIPButton: React.FC<NewIPButtonProps> = ({ principal }) => {
  const navigate = useNavigate();

  const { addChat } = useChatHistory();

  const [createIp, setCreateIp] = useState<boolean>(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const newChat = (name: string) => {
    const newChatId = addChat(name);
    navigate(`/chat/${newChatId}`);
  };

  const onIpCreated = (ipId: bigint | undefined) => {
    setCreateIp(false);
    if (ipId) {
      navigate(`/bip/${ipId}`);
    }
  };

  const [step, setStep] = useState(1);

  const [selectedDate, setSelectedDate] = useState(null);

  const typeOptions = [
    { value: "COPYRIGHT", label: "Copyright" },
    { value: "PRE_PATENT", label: "Pre-Patent" },
    { value: "TRADEMARK", label: "Trademark" },
    { value: "TRADE_SECRET", label: "Trade-Secret" },
    { value: "INDUSTRIAL_DESIGN_RIGHTS", label: "Industrial Design Rights" },
    { value: "GEOGRAPHICAL_INDICATIONS", label: "Geographical Indications" },
    { value: "PLANT_VARIETY", label: "Plant Variety" },
  ];

  const licenseOptions = [
    { value: "GAME_FI", label: "Game Fi" },
    { value: "SAAS", label: "Saas" },
    { value: "ADVERTISEMENT", label: "Advertisement" },
    { value: "META_USE", label: "Meta Use" },
    { value: "REPRODUCTION", label: "Reproduction" },
    { value: "PHYSICAL_REPRODUCTION", label: "Physical Reproduction" },
    { value: "NOT_APPLICABLE", label: "Not Applicable" },
  ];

  const [royaltySwitch, setRoyaltySwitch] = useState(false);
  const [publishSwitch, setPublishSwitch] = useState(false);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center gap-4`}
    >
      {/* {!createIp ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-[40px] border-2 px-[55px] py-[72px] text-primary-text shadow-lg shadow-violet-500/30">
          <p className="text-center text-xl font-extrabold uppercase">
          Create new IP
          </p>
          <div className="w-full flex flex-col gap-[15px]">
            <button
              className="w-full text-nowrap rounded-full bg-secondary px-4 py-3 text-sm font-semibold uppercase text-white hover:cursor-pointer hover:bg-blue-800"
              onClick={() => newChat("New chat")}
            >
              AI-Assisted IP Creation
            </button>
            <button
              className="w-full text-nowrap rounded-full bg-secondary px-4 py-3 text-sm font-semibold uppercase text-white hover:cursor-pointer hover:bg-blue-800"
              onClick={() => setCreateIp(true)}
            >
              Manual IP Creation
            </button>
          </div>
        </div>
      ) : (
        <NewIP principal={principal} isOpen={createIp} onClose={onIpCreated} />
      )} */}
      {step !== 3 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(step + 1)}
            className="flex size-[72px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black"
          >
            <TbArrowRight size={60} />
          </button>
        </div>
      )}
      {step !== 1 && (
        <div className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(step - 1)}
            className="flex size-[72px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black"
          >
            <TbArrowLeft size={60} />
          </button>
        </div>
      )}
      <div className="flex h-[85vh] min-w-[60vw] flex-col gap-[30px] overflow-y-auto rounded-[40px] bg-white px-[60px] py-[20px] backdrop-blur-[10px] dark:bg-white/10">
        {step === 1 && (
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="text-lg font-extrabold uppercase text-black dark:text-white">
                STep 1 : Create new IP
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-[#C4C4C4]" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-[#C4C4C4]" />
              </div>
            </div>
            <div className="flex w-full flex-col gap-[30px]">
              <div className="flex w-full flex-col gap-2">
                <p className="w-fit rounded-lg bg-background px-6 py-2 text-sm uppercase text-black dark:bg-white/10 dark:text-white">
                  {" "}
                  Preview{" "}
                </p>
                <FilePreview
                  className="h-[180px] w-[370px] rounded-lg border border-black bg-background dark:border-white/10 dark:bg-[#D9D9D9]"
                  dataUri={
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
                  }
                />
              </div>
              <div className="flex w-full flex-col gap-[30px]">
                {/* Upload and calendar */}
                <div className="flex w-full flex-row gap-[40px]">
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        IP File
                      </p>
                      <label className="flex h-full w-full items-center justify-between p-4 text-[16px] text-black dark:text-white">
                        Upload Image/ Video{" "}
                        <span className="text-black dark:text-gray-400">
                          {" "}
                          <CiImageOn size={22} />{" "}
                        </span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400 p-[13px]">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        Creation Date
                      </p>
                      <div className="relative w-full">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: SetStateAction<null>) =>
                            setSelectedDate(date)
                          }
                          dateFormat="MM/dd/yyyy"
                          className="custom-datepicker w-full bg-transparent text-[16px]"
                          calendarClassName="custom-calendar"
                          popperClassName="z-50"
                          placeholderText="mm/dd/yyyy"
                          inputProps={{
                            className:
                              "placeholder-black dark:placeholder-white !important",
                          }}
                        />
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-gray-400">
                          <TbCalendarEventFilled size={22} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* IP Title and Description */}
                <div className="flex w-full flex-row gap-[40px]">
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        Title of Tthe IP
                      </p>
                      <input
                        type="text"
                        placeholder=""
                        className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        Description of Tthe IP
                      </p>
                      <input
                        type="text"
                        placeholder=""
                        className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                {/* dropdowns */}
                <div className="flex w-full flex-row gap-[40px]">
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        IP Type
                      </p>
                      <Select
                        options={typeOptions}
                        styles={customStyles}
                        placeholder="Select Type"
                        value={selectedTypes}
                        onChange={(selectedOption) =>
                          setSelectedTypes(selectedOption)
                        }
                      />
                    </div>
                  </div>
                  <div className="w-6/12">
                    <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                      <p
                        className={
                          "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                        }
                      >
                        IP License
                      </p>
                      <Select
                        options={licenseOptions}
                        styles={customStyles}
                        placeholder="Select License"
                        value={selectedLicense}
                        onChange={(selectedOptions) =>
                          setSelectedLicense(selectedOptions)
                        }
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{ Option: CustomMultiValue }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-[30px]">
              <div className="flex w-full flex-row">
                <div className="flex w-6/12 flex-row items-center justify-between gap-[30px]">
                  <div className="flex w-6/12 flex-row items-center justify-between">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      Royalties
                    </p>
                    <div
                      onClick={() => setRoyaltySwitch(!royaltySwitch)}
                      className="relative h-[32px] w-[52px] cursor-pointer rounded-full bg-[#D0BCFF] px-[4px] py-[2px]"
                    >
                      <div
                        className={`absolute bottom-1/2 left-[4px] flex h-[24px] w-[24px] translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-white ${royaltySwitch ? "translate-x-[85%]" : ""}`}
                      >
                        <TbCheck size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex w-6/12 flex-row items-center justify-between">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      percent %
                    </p>
                    <input
                      type="number"
                      className="w-[60px] rounded-xl bg-background px-[10px] py-[5px] text-[16px] text-black dark:bg-white/10 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-row">
                <div className="flex w-6/12 flex-row items-center justify-between gap-[30px]">
                  <div className="flex w-6/12 flex-row items-center justify-between">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      Publishing
                    </p>
                    <div
                      onClick={() => setPublishSwitch(!publishSwitch)}
                      className="relative h-[32px] w-[52px] cursor-pointer rounded-full bg-[#D0BCFF] px-[4px] py-[2px]"
                    >
                      <div
                        className={`absolute bottom-1/2 left-[4px] flex h-[24px] w-[24px] translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-t from-primary to-secondary text-white ${publishSwitch ? "translate-x-[85%]" : ""}`}
                      >
                        <TbCheck size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex w-6/12 flex-row items-center justify-between">
                    <p className="text-[16px] font-semibold text-black dark:text-white">
                      Country
                    </p>
                    {/* <ReactCountryDropdown
                        defaultCountry={DEFAULT_PUBLISHING.countryCode}
                        onSelect={(val) =>
                          setIntPropInput((intProp) => {
                            return {
                              ...intProp,
                              publishing: [
                                {
                                  date:
                                    fromNullable(intProp.publishing)?.date ??
                                    DEFAULT_PUBLISHING.date,
                                  countryCode: val.code,
                                },
                              ],
                            };
                          })
                        }
                      /> */}
                  </div>
                </div>
                <div className="flex w-6/12 flex-row items-center justify-center gap-[30px]">
                  <p className="text-[16px] font-semibold text-black dark:text-white">
                    Date
                  </p>
                  <div className="relative w-[140px] rounded-lg bg-white/10 px-4 py-1">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: SetStateAction<null>) =>
                        setSelectedDate(date)
                      }
                      dateFormat="MM/dd/yyyy"
                      className="custom-datepicker w-full bg-transparent text-[16px]"
                      calendarClassName="custom-calendar"
                      popperClassName="z-50"
                      placeholderText="mm/dd/yyyy"
                      inputProps={{
                        className:
                          "placeholder-black dark:placeholder-white !important",
                      }}
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-gray-400">
                      <TbCalendarEventFilled size={22} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="text-lg font-extrabold uppercase text-black dark:text-white">
                STep 2 : Validate Author Details
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-[#C4C4C4]" />
              </div>
            </div>
            <div className="flex w-6/12 flex-col items-center justify-center gap-[40px]">
              <div className="size-[100px] rounded-full border bg-white">
                <FilePreview
                  dataUri={
                    "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                  }
                  className={"h-[100px] w-[100px] rounded-full bg-white"}
                />
              </div>
              <div className="flex w-full flex-col gap-[20px]">
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    First Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={"John"}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Last Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={"Doe"}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Nick Name
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={"Johnny"}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Speciality
                  </p>
                  <input
                    type="text"
                    placeholder=""
                    className="bg-transparent p-[15px] text-[16px] text-black dark:text-white"
                    value={"Blockchain"}
                    readOnly
                  />
                </div>
                <div className="relative flex w-full flex-col rounded-md border border-gray-400">
                  <p
                    className={
                      "absolute left-4 top-0 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 transition-all duration-200 ease-in dark:bg-[#2f2f2f]"
                    }
                  >
                    Country
                  </p>
                  {/* <ReactCountryDropdown
                    defaultCountry={userArgs.countryCode}
                    onSelect={(val) => {
                      setUserArgs({ ...userArgs, countryCode: val.code });
                      handleBlur("countryCode", val.code);
                    }}
                  /> */}
                </div>
              </div>
            </div>
          </div>
        )}
        {step == 3 && (
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex flex-col items-center gap-[15px]">
              <p className="text-lg font-extrabold uppercase text-black dark:text-white">
                STep 3 : Success
              </p>
              <div className="flex w-full flex-row items-center gap-1">
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
                <div className="h-[4px] min-w-[200px] rounded-full bg-gradient-to-t from-primary to-secondary" />
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-[40px] pt-[20px]">
                <div className="rounded-[40px] border-y-[2.5px] border-white/40 bg-white/10 px-3 py-4">
                  <div className="size-[280px] overflow-hidden rounded-[40px] bg-background">
                    <img
                      src={""}
                      alt="IP Img"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="w-full py-[20px] text-center text-2xl text-black dark:text-white">
                    Connect Hat
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-[10px] text-center text-3xl text-black dark:text-white">
                  <p>Congratulations!</p>
                  <p>Your IP has been successfully created.</p>
                </div>
              </div>
              <div className="flex flex-row gap-5 pt-[10px]">
                <button className="rounded-xl border-2 border-primary bg-transparent px-6 py-3 text-xl text-primary">
                  Manage IPs
                </button>
                <button className="rounded-xl border-2 border-primary bg-gradient-to-t from-primary to-secondary px-6 py-3 text-xl text-white">
                  List On Marketplace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewIPButton;
