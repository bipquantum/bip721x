import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInternetIdentity } from "@internet-identity-labs/react-ic-ii-auth";
import { Avatar, CircularProgress } from "@mui/material";

import profile from "../../assets/profile.png";
import getActor from "../../../utils/getActor";
import TextField from "../../components/TextField";
import { useSelector } from "react-redux";

const UserProfile = ({}) => {
  const { identity, isAuthenticated } = useInternetIdentity();
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const navigate = useNavigate();
  const appState = useSelector((reducers) => reducers.appReducer);

  useEffect(() => {
    fetchProfileDetails();
  }, [isAuthenticated]);

  const fetchProfileDetails = async () => {
    try {
      const actor = await getActor(identity);
      const details = await actor.getMyProfile();
      setProfileDetails(details?.ok);
      console.log("DETAILS: ", details);
    } catch (error) {
      console.log("ERROR: ", error);
    } finally {
      setFetching(false);
    }
  };

  const updateUserProfileClickHandler = async () => {
    try {
      setUpdating(true);
      const actor = await getActor(identity);
      const updated = await actor.updateUserProfile({
        name: [profileDetails.name],
        familyName: [profileDetails.familyName],
        nickName: [profileDetails.nickName],
        speciality: [profileDetails.speciality],
        country: [profileDetails.country],
      });
      console.log("updated: ", updated);
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e, fieldID) => {
    const id = e.target.id || fieldID;
    const value = e.target.value;

    setProfileDetails((v) => ({ ...v, [id]: value }));
  };

  if (!isAuthenticated) {
    navigate("/");
    return <></>;
  }

  if (fetching) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "85vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col"
      style={{
        marginTop: "6rem",
        minHeight: "80vh",
      }}
    >
      <div
        className="w-full flex flex-col items-center justify-center mb-4"
        style={{
          flexDirection: "column",
        }}
      >
        <Avatar
          alt="Profile"
          src={profile}
          sx={{
            width: "4rem",
            height: "4rem",
            marginBottom: "1rem",
          }}
        />
        <h6
          style={{
            fontSize: appState.isSmallScreen ? ".8rem": "1rem",
            fontWeight: "bold",
          }}
        >
          {identity.getPrincipal().toText()}
        </h6>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            alignItems: "center",
            marginTop: "2rem",
          }}
        >
          <TextField
            id="name"
            label="Name"
            value={profileDetails.name}
            handleChange={handleChange}
          />
          <TextField
            id="familyName"
            label="Family Name"
            value={profileDetails.familyName}
            handleChange={handleChange}
          />
          <TextField
            id="nickName"
            label="Nick Name"
            value={profileDetails.nickName}
            handleChange={handleChange}
          />
          <TextField
            id="speciality"
            label="Speciality"
            value={profileDetails.speciality}
            handleChange={handleChange}
          />
          <TextField
            id="country"
            label="Country"
            value={profileDetails.country}
            handleChange={handleChange}
          />
          <button
            onClick={() => updateUserProfileClickHandler()}
            className="btn"
            disabled={updating || !isAuthenticated}
            style={{
              marginTop: "1.2rem",
              background: updating || !isAuthenticated ? "grey" : "#6BD0BA",
              color: updating || !isAuthenticated ? "white" : "black",
              width: appState.isSmallScreen ? "80%" : "22.5rem",
            }}
          >
            {updating ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
