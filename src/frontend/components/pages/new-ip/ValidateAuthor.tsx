import { useEffect, useRef, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useLocation, useNavigate } from "react-router-dom";
import { backendActor } from "../../actors/BackendActor";
import { toast } from "react-toastify";
import { User } from "../../../../declarations/backend/backend.did";
import { fromNullableExt } from "../../../utils/conversions";
import UserImage from "../../common/UserImage";

interface ValidateAuthorProps {
  principal: Principal | undefined;
}

const ValidateAuthor: React.FC<ValidateAuthorProps> = ({ principal }) => {
  const navigate = useNavigate();
  const toastShownRef = useRef(false);
  const { pathname } = useLocation();

  const [user, setUser] = useState<User | undefined>(undefined);

  const { call: queryUser } = backendActor.useQueryCall({
    functionName: "get_user",
  });

  useEffect(() => {
    if (principal !== undefined) {
      queryUser([principal]).then((queriedUser) => {
        let user = fromNullableExt(queriedUser);
        if (user === undefined && !toastShownRef.current) {
          toastShownRef.current = true; // Set flag to true after first toast
          navigate("/profile", { state: { redirect: pathname } });
          toast.warn("Please add user");
        } else {
          setUser(user);
        }
      });
    }
  }, [principal]);

  return (
    <div className="flex flex-grow flex-col items-center w-full lg:w-10/12 xl:w-8/12 gap-[30px] sm:flex-grow-0">
      <div className="flex w-full flex-col items-center gap-[15px] sm:w-2/3">
        <p className="font-momentum text-lg font-extrabold uppercase text-black dark:text-white">
          Step 2 : Validate Author Details
        </p>
        <div className="flex w-full flex-row items-center gap-1">
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-gradient-to-t from-primary to-secondary" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
          <div className="h-[4px] w-full rounded-full bg-[#C4C4C4]" />
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-[40px] md:w-6/12">
        <UserImage
          principal={principal}
          className="size-[100px] rounded-full border bg-white"
        />
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
              className="bg-transparent p-[15px] text-base text-black dark:text-white"
              value={user?.firstName}
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
              className="bg-transparent p-[15px] text-base text-black dark:text-white"
              value={user?.lastName}
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
              className="bg-transparent p-[15px] text-base text-black dark:text-white"
              value={user?.nickName}
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
              className="bg-transparent p-[15px] text-base text-black dark:text-white"
              value={user?.specialty}
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
            <input
              type="text"
              placeholder=""
              className="bg-transparent p-[15px] text-base text-black dark:text-white"
              value={user?.countryCode}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
};

export default ValidateAuthor;
