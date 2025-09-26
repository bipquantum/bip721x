import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import { TbArrowLeft, TbArrowRight } from "react-icons/tb";
import { toast } from "react-toastify";
import { IntPropInput } from "../../../../declarations/backend/backend.did";
import { dateToTime } from "../../../utils/conversions";
import SuperJSON from "superjson";
import { LegalDeclaration } from "./LegalDeclaration";
import { validateIpDataUri, validateIpDescription, validateIpTitle } from "../../../utils/validation";
import NewIpInputs from "./NewIpInputs";
import ValidateAuthor from "./ValidateAuthor";
import IpCreated from "./IpCreated";


interface NewIPProps {
  principal: Principal | undefined;
}

const NewIP: React.FC<NewIPProps> = ({ principal }) => {

  const EMPTY_INT_PROP: IntPropInput = {
    dataUri: "",
    title: "",
    intPropLicenses: [],
    intPropType: { COPYRIGHT: null },
    description: "",
    creationDate: dateToTime(new Date()),
    publishing: [],
    percentageRoyalties: [],
  };

  const loadIntPropInput = () => {
    try {
      const storedValue = sessionStorage.getItem("intPropInput");
      return storedValue ? SuperJSON.parse<IntPropInput>(storedValue) : EMPTY_INT_PROP;
    } catch (error) {
      console.error("Failed to load intPropInput from sessionStorage:", error);
      return EMPTY_INT_PROP; // Return default value on error
    }
  };

  const save = (intPropInput: IntPropInput) => {
    try {
      sessionStorage.setItem("intPropInput", SuperJSON.stringify(intPropInput));
    } catch (error) {
      console.error("Failed to save intPropInput to sessionStorage:", error);
      toast.error("Failed to save form data: " + error);
    }
  };

  const clear = () => {
    sessionStorage.removeItem("intPropInput");
  };

  const [step, setStep] = useState(1);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [ipId, setIpId] = useState<bigint | undefined>(undefined);
  const [intPropInput, setIntPropInput] =
    useState<IntPropInput>(loadIntPropInput());
  // Required for file preview (step 4)
  // @todo: should use actual dataUri returned by query
  const [dataUri, setDataUri] = useState<string>(loadIntPropInput().dataUri);

  const { call: createIntProp, loading } = backendActor.useUpdateCall({
    functionName: "create_int_prop",
    onSuccess: (data) => {
      if (data === undefined) {
        toast.error("Failed to create new IP: no data returned");
      } else if ("err" in data) {
        let errorMsg = "Unknown error";
        if (typeof data.err === "object" && data.err !== null) {
          const errVariant = Object.values(data.err)[0];
          if (
            errVariant &&
            typeof errVariant === "object" &&
            "message" in errVariant
          ) {
            errorMsg = (errVariant as any).message;
          } else {
            errorMsg = JSON.stringify(data.err);
          }
        } else if (typeof data.err === "string") {
          errorMsg = data.err;
        }
        toast.error("Failed to create new IP: " + errorMsg);
        console.error("error", data);
      } else {
        setIpId(data["ok"]);
        clear(); // Clear the form data after successful creation
        setStep(4);
      }
    },
    onError: (error) => {
      console.error("error", error);
      toast.error("Failed to create new IP: " + error);
    },
  });

  // Persist form state on every change
  useEffect(() => {
    save(intPropInput);
  }, [intPropInput]);

  return (
    <div
      className={`relative flex w-full flex-grow justify-center sm:flex-grow-0 md:items-center`}
    >
      {step === 1 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => {
              let error =
                validateIpTitle(intPropInput) ||
                validateIpDataUri(intPropInput) ||
                validateIpDescription(intPropInput);
              if (error !== undefined) {
                toast.warn("Invalid BIP: fix required fields");
                return;
              }
              setStep(2);
            }}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            <TbArrowRight size={60} />
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(3)}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-transparent border-t-white dark:border-t-black"></div>
            ) : (
              <TbArrowRight size={60} />
            )}
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="absolute right-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => {
              if (!disclaimerAccepted) {
                toast.warn("Please accept the legal declaration");
                return;
              }
              createIntProp([intPropInput]);
            }}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            {loading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-transparent border-t-white dark:border-t-black"></div>
            ) : (
              <TbArrowRight size={60} />
            )}
          </button>
        </div>
      )}
      {step !== 1 && step !== 4 && (
        <div className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2">
          <button
            onClick={() => setStep(step - 1)}
            className="flex size-[32px] items-center justify-center rounded-full bg-background-dark text-white dark:bg-white dark:text-black md:size-[54px] lg:size-[72px]"
          >
            <TbArrowLeft size={60} />
          </button>
        </div>
      )}

      <div className="flex w-full flex-grow flex-col gap-[30px] overflow-y-auto bg-white px-[10px] py-[20px] backdrop-blur-[10px] dark:bg-white/10 sm:h-[80dvh] sm:flex-grow-0 sm:rounded-[10px] md:rounded-[40px] md:px-[30px] lg:w-10/12 lg:px-[60px] xl:w-8/12">
        {step === 1 && <NewIpInputs intPropInput={intPropInput} setIntPropInput={setIntPropInput} dataUri={dataUri} setDataUri={setDataUri} />}
        {step === 2 && <ValidateAuthor principal={principal} />}
        {step == 3 && <LegalDeclaration disclaimerAccepted={disclaimerAccepted} setDisclaimerAccepted={setDisclaimerAccepted}/>}
        {step == 4 && ipId !== undefined && <IpCreated intPropInput={intPropInput} ipId={ipId} dataUri={dataUri}/>}
      </div>
    </div>
  );
};

export default NewIP;
