import React, { useState } from "react";
import { useSelector } from "react-redux";
import TextField from "../../components/TextField";
import Dropdown from "../../components/Dropdown";
import InputNumberField from "../../components/InputNumber";
import { useInternetIdentity } from "@internet-identity-labs/react-ic-ii-auth";
import { backend } from "../../../../declarations/backend";
import getActor from "../../../utils/getActor";
import { useNavigate } from "react-router-dom";

const CreateIPForm = () => {
  const appState = useSelector((reducers) => reducers.appReducer);
  const navigate = useNavigate();
  const { isAuthenticated, identity } = useInternetIdentity();

  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState({
    title: "",
    description: "",
    ipLicense: "SAAS",
    ipType: "COPYRIGHT",
    ipPrice: "",
  });

  const IPTypeOptions = [
    { title: "Copyright", value: "COPYRIGHT" },
    { title: "Patent", value: "PATENT" },
    { title: "IP Certificate", value: "IP_CERTIFICATE" },
  ];

  const IPLicensesTypeOptions = [
    { title: "SAAS", value: "SAAS" },
    { title: "Reproduction", value: "REPRODUCTION" },
    { title: "Gaame FI", value: "GAME_FI" },
    { title: "Meta use", value: "META_USE" },
    { title: "Physical Reproduction", value: "PHYSICAL_REPRODUCTION" },
    { title: "Advertisement", value: "ADVERTISEMENT" },
    { title: "Not Applicable", value: "NOT_APPLICABLE" },
  ];

  const handleChange = (e, fieldID) => {
    const id = e.target.id || fieldID;
    const value = e.target.value;

    setValues((v) => ({ ...v, [id]: value }));
  };

  const createIPClick = async () => {
    setCreating(true);

    try {
      const createDetails = {
        title: values.title,
        description: values.description,
        ipLicense: { [values.ipLicense]: null },
        ipType: { [values.ipType]: null },
        ipPrice: values.ipPrice,
        ipPriceCurrency: "USD",
      };
      const actor = await getActor(identity);
      const _created = await actor.createIP(createDetails);
      navigate("/");
    } catch (error) {
      console.log("ERROR: ", error);
    } finally {
      setCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h4>Please signin first to create IP</h4>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "auto",
        minHeight: "74vh",
        marginTop: "5rem",
      }}
    >
      {/* <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "2rem",
        }}
      > */}
      <TextField
        id="title"
        label="Title"
        value={values.title}
        handleChange={handleChange}
      />
      <TextField
        id="description"
        label="Description"
        value={values.description}
        handleChange={handleChange}
      />
      <Dropdown
        id="ipType"
        label="IP Type"
        placeholder="Select IP Type"
        value={values.ipType}
        options={IPTypeOptions}
        onChange={handleChange}
        optionLabel={"title"}
      />
      <Dropdown
        id="ipLicense"
        label="IP License"
        placeholder="Select IP License Type"
        value={values.ipLicense}
        options={IPLicensesTypeOptions}
        onChange={handleChange}
        optionLabel={"title"}
      />
      <InputNumberField
        id="ipPrice"
        label={"IP Price (in USD)"}
        value={values.ipPrice}
        onChange={handleChange}
      />
      <button
        onClick={() => createIPClick()}
        className="btn"
        disabled={creating || !isAuthenticated}
        style={{
          marginTop: "1.2rem",
          background: creating || !isAuthenticated ? "grey" : "#6BD0BA",
          color: creating || !isAuthenticated ? "white" : "black",
          width: appState.isSmallScreen ? "80%" : "22.5rem",
        }}
      >
        {creating ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : (
          "Create"
        )}
      </button>
      {/* </div> */}
    </div>
  );
};

export default CreateIPForm;
