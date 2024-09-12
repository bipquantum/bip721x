import React, { useState } from "react";

type ToggleSwitchProps = {
  vaule: boolean;
  setValue: (value: boolean) => void;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ setValue, vaule }) => {
  const onToggle = () => {
    setValue(!vaule);
  };

  return (
    <label
      className="relative inline-block h-8 w-14 transition duration-200 ease-in-out"
      htmlFor="toggle"
    >
      <input
        type="checkbox"
        id="toggle"
        className="sr-only" // sr-only is a Tailwind CSS class to hide input visually but keep it accessible
        checked={vaule}
        onChange={onToggle}
      />
      <span className="block h-full w-full rounded-full bg-gray-200 shadow-inner"></span>
      <span
        className={`${
          vaule ? "translate-x-6" : "translate-x-0"
        } absolute left-1 top-1 h-6 w-6 rounded-full bg-blue-500 shadow transition-transform duration-200 ease-in-out`}
      ></span>
    </label>
  );
};

export default ToggleSwitch;
