import AIBotImg from "../../../assets/ai-bot.jpeg";

function BipDetails() {
  return (
    <div className="m-auto flex w-2/3 flex-col gap-y-4 rounded-3xl bg-white px-12 py-4">
      <div className="flex w-full gap-x-12">
        <img
          src={AIBotImg}
          className="h-48 w-1/2 rounded-2xl object-cover"
          alt="Logo"
        />
        <img
          src={AIBotImg}
          className="h-48 w-1/2 rounded-2xl object-cover"
          alt="Logo"
        />
      </div>
      <div className="text-sm">
        <div className="py-2 text-base font-bold">Ovni Car</div>
        <div>
          Type: Pre-Patent
          <br /> License: Reproduction
          <br />
          <br /> Création Date: 15-01-2024
          <br />
          <br /> Publication Date: 20-02-2024
          <br />
          <br /> Author(s) Details:
          <br /> Name + Family Name
          <br /> Address
          <br /> Specialty
          <br />
          <br /> Owner(s) Details
          <br /> Name + Family Name
          <br /> Address
          <br />
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="text-base text-blue-400">$ 200 000,00</div>
        <button className="rounded-full bg-blue-400 px-4 py-2 text-xl font-semibold uppercase text-white">
          Buy now
        </button>
      </div>
    </div>
  );
}

export default BipDetails;
