import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputBase from "@mui/material/InputBase";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(1),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "transparent",
    border: "1px solid grey",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

const DropdownComponent = ({
  id,
  label,
  placeholder,
  value,
  options = [],
  onChange,
  optionLabel,
}) => {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        flexDirection: "column",
        minWidth: "22rem",
        marginTop: "1rem",
      }}
    >
      <div
        className="card flex flex-col justify-content-center w-full"
        style={{
          flexDirection: "column",
        }}
      >
        <label
          htmlFor={id}
          className="text-white w-full"
          style={{ fontSize: "1rem", marginBottom: 0 }}
        >
          {label}
        </label>
        <Select
          labelId="demo-customized-select-label"
          id={id}
          value={value}
          onChange={(e) => onChange(e, id)}
          input={<BootstrapInput />}
          style={{
            background: "transparent",
            color: "white",
          }}
        >
          {options.map((option, index) => (
            <MenuItem value={option.value} key={index}>
              {option.title}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default DropdownComponent;
