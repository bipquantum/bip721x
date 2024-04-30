import React from "react";
import { InputText } from "primereact/inputtext";

const TextField = ({ id, label, value = "", subtext = "", handleChange }) => {
  return (
    <div
      className="card flex justify-content-center"
      style={{
        marginTop: ".8rem",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          flexDirection: "column",
          minWidth: "22rem",
        }}
      >
        <label
          htmlFor={id}
          className="text-white w-full"
          style={{
            fontSize: "1rem",
            marginBottom: ".4rem",
          }}
        >
          {label}
        </label>
        <InputText
          id={id}
          aria-describedby={`${id}-help`}
          onChange={handleChange}
          value={value}
          style={{
            fontSize: "1.1rem",
            borderRadius: ".4rem",
            padding: ".4rem .8rem",
            background: "transparent",
            border: "1px solid grey",
            width: "100%",
          }}
        />
        <small id={`${id}-subtext`}>{subtext}</small>
      </div>
    </div>
  );
};

export default TextField;
