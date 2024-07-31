import React from "react";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
      }}
    >
      <h2
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "1.2rem",
        }}
      >
        Page not found
      </h2>
    </div>
  );
};

export default NotFound;
