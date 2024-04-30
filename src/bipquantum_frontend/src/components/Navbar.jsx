import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import profile from "../assets/profile.png";
import { AuthButton } from "./AuthButton";
import { useInternetIdentity } from "@internet-identity-labs/react-ic-ii-auth";
import { Copy, LogOut, User } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../store/authReducer";

const Navbar = () => {
  const authState = useSelector((selectors) => selectors.authReducer);
  const appState = useSelector((selectors) => selectors.appReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { signout, authenticate, isAuthenticated, identity } =
    useInternetIdentity();

  const signoutHandler = () => {
    signout();
    reset();
  };

  const reset = () => {
    dispatch(signOut());
  };

  const hexRepresentation = (hexString) => {
    // Extract the first and last 4 characters
    const prefix = hexString.slice(0, 4);
    const suffix = hexString.slice(-3);

    // Return formatted string
    return prefix + "..." + suffix;
  };

  return (
    <div
      className="drawer drawer-end"
      style={{
        zIndex: 9999,
        top: 0,
        position: "fixed",
      }}
    >
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl" onClick={() => navigate("/")}>
            BIPQuantum
          </a>
          <div className="form-control m-auto">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-24 md:w-auto"
              style={{
                width: appState.isSmallScreen ? "8rem" : "24rem",
                display: appState.isSmallScreen ? "none" : "block",
              }}
            />
          </div>
        </div>
        {authState?.authenticating ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : authState?.userAccountPrincipal ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {!window.location.href?.includes("/ip/create") && (
              <button
                className="btn btn-outline btn-primary"
                style={{
                  borderRadius: "2rem",
                  padding: ".2rem 1rem",
                  marginRight: ".8rem",
                  fontSize: ".8rem",
                }}
                onClick={() => navigate("/ip/create")}
              >
                Create IP
              </button>
            )}
            <div className="dropdown dropdown-end">
              <button className="flex mr-8 items-center">
                <img
                  src={profile}
                  alt="profile"
                  style={{
                    width: "1.8rem",
                    borderRadius: "50%",
                    marginRight: ".5rem",
                  }}
                />
                <span
                  className="text-white"
                  style={{
                    fontSize: "1rem",
                  }}
                >
                  {hexRepresentation(
                    authState.userAccountPrincipal.getPrincipal().toText()
                  )}
                </span>
              </button>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content rounded-box w-56 bg-slate-700"
              >
                <li>
                  <a
                    className="flex justify-between"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        authState.userAccountPrincipal.getPrincipal().toText()
                      );
                    }}
                  >
                    <Copy size={"1rem"} />
                    <span className="mr-auto">
                      Principal ID:{" "}
                      {hexRepresentation(
                        authState.userAccountPrincipal.getPrincipal().toText()
                      )}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="flex justify-between"
                    onClick={() => navigate("/profile")}
                  >
                    <User size={"1rem"} />
                    <span className="mr-auto">Profile</span>
                  </a>
                </li>
                <li onClick={() => signoutHandler()}>
                  <a className="flex justify-between">
                    <LogOut size={"1rem"} />
                    <span className="mr-auto">Disconnect</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex-none gap-2">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Page content here */}
              <label
                htmlFor="my-drawer-4"
                className="btn-outline btn-secondary btn "
                style={{
                  borderRadius: "2rem",
                  width: appState.isSmallScreen ? "6rem" : "8rem",
                }}
              >
                Connect
              </label>
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer-4"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <div className="btn btn-ghost text-xl mb-4 bg-gray-700 hover:bg-gray-700">
                  BIPQuantum
                </div>
                {/* Sidebar content here */}
                <li>
                  <AuthButton
                    userAccountPrincipal={authState.userAccountPrincipal}
                    reset={reset}
                    signoutHandler={signoutHandler}
                    authenticate={authenticate}
                    isAuthenticated={authState.authenticated}
                    identity={identity}
                  />
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
