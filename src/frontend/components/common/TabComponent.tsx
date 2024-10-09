import React from "react";

type TabsComponentProps = {
  activeTab: number;
  setActiveTab: (index: number) => void;
  tabs: string[];
};

const TabsComponent = ({
  activeTab,
  setActiveTab,
  tabs,
}: TabsComponentProps) => {
  return (
    <div className="w-52">
      {/* Tab buttons */}
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`flex-grow px-4 py-2 text-lg font-medium ${
              activeTab === index
                ? "rounded-lg rounded-b-none border-2 border-b-0 border-white text-white"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsComponent;
