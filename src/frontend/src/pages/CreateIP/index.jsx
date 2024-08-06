import React, { useState } from "react";
import CreateIPForm from "./CreateIPForm";

const CreateIP = ({}) => {
  const [formEntries, setFormEntries] = useState({
    title: "",
    description: "",
    ipType: "",
    ipLicense: "",
    ipPrice: "",
    ipPriceCurrency: "",
  });

  return <CreateIPForm />;
};

export default CreateIP;
