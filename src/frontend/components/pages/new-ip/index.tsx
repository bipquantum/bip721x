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

  const getStepInfo = () => {
    switch (step) {
      case 1:
        return {
          title: "Create new BIP",
          canGoNext: !validateIpTitle(intPropInput) && !validateIpDataUri(intPropInput) && !validateIpDescription(intPropInput),
          nextAction: () => {
            scrollToTop();
            setStep(2);
          },
          nextLabel: "Continue to Author Validation"
        };
      case 2:
        return {
          title: "Validate Author Details",
          canGoNext: true,
          nextAction: () => {
            scrollToTop();
            setStep(3);
          },
          nextLabel: "Continue to Legal Declaration"
        };
      case 3:
        return {
          title: "Legal Declaration",
          canGoNext: disclaimerAccepted,
          nextAction: () => {
            scrollToTop();
            createIntProp([intPropInput]);
          },
          nextLabel: "Create IP"
        };
      case 4:
        return {
          title: "IP Created Successfully",
          canGoNext: false,
          nextAction: () => {},
          nextLabel: ""
        };
      default:
        return {
          title: "",
          canGoNext: false,
          nextAction: () => {},
          nextLabel: ""
        };
    }
  };

  const stepInfo = getStepInfo();

  // Ref for the scrollable content area
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top function
  const scrollToTop = () => {
    if (contentRef.current) {
      console.log('Scrolling content ref to top');
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('Content ref not found, using window scroll');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  //  Precise Height Calculation
  //
  //  Mobile (default):
  //
  //  min-h-[calc(100vh-8rem)]
  //  - 100vh: Full viewport height
  //  - minus 4rem: Topbar height (min-h-16)
  //  - minus 4rem: Mobile navbar height (h-16)
  //  - = 100vh - 8rem
  //
  //  Small screens and up:
  //
  //  sm:min-h-[calc(100vh-9rem)]
  //  - 100vh: Full viewport height
  //  - minus 5rem: Topbar height (sm:min-h-20)
  //  - = 100vh - 5rem

  return (
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-5rem)] w-full flex-col">
      {/* Main Content */}
      <div className="flex flex-grow bg-white dark:bg-white/10 backdrop-blur-[10px] overflow-hidden">
        <div
          ref={contentRef}
          className="flex w-full flex-col overflow-y-auto py-[20px] mx-auto items-center px-[10px] md:px-[30px] lg:px-[60px]"
        >
          {step === 1 && <NewIpInputs intPropInput={intPropInput} setIntPropInput={setIntPropInput} dataUri={dataUri} setDataUri={setDataUri} />}
          {step === 2 && <ValidateAuthor principal={principal} />}
          {step == 3 && <LegalDeclaration disclaimerAccepted={disclaimerAccepted} setDisclaimerAccepted={setDisclaimerAccepted}/>}
          {step == 4 && ipId !== undefined && <IpCreated intPropInput={intPropInput} ipId={ipId} dataUri={dataUri}/>}
        </div>
      </div>

      {/* Sticky Navigation Footer */}
      {step !== 4 && (
        <div className="sticky bottom-0 z-20 bg-background dark:bg-background-dark p-4 backdrop-blur-sm w-full">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Back Button */}
            {step > 1 ? (
              <button
                onClick={() => {
                  scrollToTop();
                  setStep(step - 1);
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <TbArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {/* Next Button */}
            <button
              onClick={() => {
                if (!stepInfo.canGoNext) {
                  if (step === 1) {
                    toast.warn("Please complete all required fields");
                  } else if (step === 3) {
                    toast.warn("Please accept the legal declaration");
                  }
                  return;
                }
                stepInfo.nextAction();
              }}
              disabled={!stepInfo.canGoNext || loading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                stepInfo.canGoNext && !loading
                  ? "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
                  : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  {stepInfo.nextLabel}
                  <TbArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewIP;
