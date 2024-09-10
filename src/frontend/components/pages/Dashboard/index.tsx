import SearchSvg from "../../../assets/search.svg";

function Dashboard() {
  return (
    <div className="flex h-full w-full flex-1 flex-col justify-between overflow-auto">
      <div className="flex h-full flex-col items-start justify-center px-16 text-blue-900">
        <div className="flex flex-col items-center gap-8 py-16 text-3xl font-bold uppercase tracking-wider">
          Meet ArtizBot, Your Intellectual Property Guardian.
          <div className="h-1 w-96 bg-blue-900"></div>
        </div>
        <div className="flex flex-col items-start justify-start gap-16 text-xl">
          <div>
            <div className="font-semibold">Certify Your Creations</div>
            <div className="list-disc px-2">
              <li>
                "Secure your AI Art masterpiece with bIP certification today."
              </li>
              <li>
                "Transform your digital asset into a certified, market-ready
                product."
              </li>
              <li>
                "Turn your creative concept into a protected asset, ready for
                the market."
              </li>
            </div>
          </div>
          <div>
            <div className="font-semibold">
              Monetize Your Intellectual Assets
            </div>
            <div className="list-disc px-2">
              <li>
                "Step into the future; tokenize your IP and open doors to
                unprecedented profits."
              </li>
              <li>
                "Unlock the full potential of your IP with customized licensing
                options."
              </li>
              <li>
                "Maximize your earnings with well-defined royalty schemes for
                your intellectual assets."
              </li>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-400 px-16 py-8">
        <div className="flex w-full items-center justify-between gap-4 rounded-md bg-white px-6 py-4">
          <input
            className="w-full text-blue-900 outline-none"
            placeholder="What do want to proetect?"
          />
          <img src={SearchSvg} className="h-10" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
