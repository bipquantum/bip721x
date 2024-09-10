import React, { useState } from "react";
import UserSvg from "../assets/user.svg";

const data = [
  {
    label: "Type",
    name: "type",
  },
  {
    label: "Overview",
    name: "overview",
  },
  {
    label: "Work",
    name: "work",
  },
  {
    label: "Author",
    name: "author",
  },
];

function Copyright() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-end">
      <div className="mb-1 flex w-1/2 flex-col items-center gap-10">
        <div className="relative flex justify-center gap-20">
          <div className="absolute z-0 mt-5 h-0.5 w-full bg-gray-500"></div>
          {data.map((item, index) => (
            <div className="z-50 flex flex-col items-center gap-2" key={index}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${item.name === "type" ? "bg-blue-800" : "bg-gray-500"}`}
              >
                <img src={UserSvg} className="h-6 invert" />
              </div>
              <div className="text-sm">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl">Choose Registration Type</div>
          <div className="flex justify-center gap-12 text-center">
            <div className="flex w-1/3 flex-col items-center justify-between gap-6">
              <div className="flex w-full flex-col items-center justify-start gap-6">
                <div className="text-xl font-bold">Single IP Protection</div>
                <div className="text-base">
                  One published or unpublished intellectual property.
                  <br />
                  <br />
                  IP cannot be a work for hire.
                  <br />
                  <br /> Creator must be the claimant.
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-start gap-6">
                <div className="flex items-center justify-start gap-2">
                  <div className="mb-4 text-3xl">$</div>
                  <div className="text-[48px] font-bold">98</div>
                </div>
                <button className="w-full rounded-2xl bg-blue-800 py-2 text-2xl text-white">
                  SELECT
                </button>
              </div>
            </div>
            <div className="flex w-1/3 flex-col items-center justify-between gap-6">
              <div className="flex w-full flex-col items-center justify-start gap-6">
                <div className="text-xl font-bold">Multiple IP Protection</div>
                <div className="text-base">
                  Register up to 750 intellectual properties in one
                  registration.
                  <br />
                  <br />
                  IPs must be unpublished.
                </div>
              </div>
              <div className="flex w-full flex-col items-center justify-start gap-6">
                <div className="flex items-center justify-start gap-2">
                  <div className="mb-4 text-3xl">$</div>
                  <div className="text-[48px] font-bold">119</div>
                </div>
                <button className="w-full rounded-2xl bg-blue-800 py-2 text-2xl text-white">
                  SELECT
                </button>
              </div>
            </div>
          </div>
          <div className="text-sm">
            All costs encompass the submission fees to the copyright office.
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-blue-400 px-16 py-8 text-xl text-white">
        <div>SELECTED:&nbsp;</div>
        <div className="font-bold">Single IP Protection&nbsp;</div>
        <div>- TOTAL</div>
        <div className="font-bold">&nbsp;$99.00</div>
      </div>
    </div>
  );
}

export default Copyright;
