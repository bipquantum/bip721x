import React from "react";
import { InputNumber } from "primereact/inputnumber";

const InputNumberField = ({ id, label, value, onChange }) => {
  return (
    <div
      className="card flex justify-content-center"
      style={{
        marginTop: "1rem",
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
          htmlFor="integeronly"
          className="text-white w-full"
          style={{
            fontSize: "1rem",
            marginBottom: ".4rem",
          }}
        >
          {label}
        </label>
        <InputNumber
          inputId="integeronly"
          id={id}
          value={value}
          onValueChange={onChange}
          inputStyle={{
            background: "transparent",
            outline: "none",
            border: "none",
          }}
          style={{
            fontSize: "1.1rem",
            borderRadius: ".4rem",
            padding: ".4rem .8rem",
            background: "transparent",
            border: "1px solid grey",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default InputNumberField;
