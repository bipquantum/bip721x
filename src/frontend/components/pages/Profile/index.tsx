import ProfileSvg from "../../../assets/profile.png";

const ProfileFields = [
  { label: "Name", name: "name", placeholder: "Sam" },
  { label: "Family Name", name: "family_name", placeholder: "Drissi" },
  { label: "Nick Name", name: "nick_name", placeholder: "Samlee" },
  {
    label: "Speciality",
    name: "speciality",
    placeholder: "Blockchain stratgic architect",
  },
  { label: "Country", name: "country", placeholder: "Canada" },
];

function Profile() {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-8">
      <img src={ProfileSvg} className={`h-24 w-24 rounded-full`} />
      <div className="text-sm text-blue-400">
        dfyro-v2ila-oawun-kvjhr-xmtvk-msujr-axgx2-3s7lo-phya3-lry2v-pqe
      </div>
      <div className="mt-16 flex w-80 flex-col gap-2 bg-blue-400 px-6 py-4 text-base text-white">
        {ProfileFields.map((field) => (
          <div className="flex w-full flex-col justify-start gap-1">
            <div className="text-sm">{field.label}</div>
            <input
              className="w-full rounded-md border-[1px] border-white border-opacity-35 bg-blue-300 bg-opacity-35 px-2 py-1 placeholder-white outline-none"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
      <button className="w-[340px] rounded-full bg-blue-600 py-2 text-center text-lg text-white">
        +Add/Update User
      </button>
    </div>
  );
}

export default Profile;
