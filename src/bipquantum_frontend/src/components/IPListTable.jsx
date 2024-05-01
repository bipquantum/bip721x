import React from "react";
import { Principal } from "@dfinity/principal";
import { useSelector } from "react-redux";
import IPCard from "./IPCard";

const IPListTable = ({ ipList = [] }) => {
  const appState = useSelector((reducers) => reducers.appReducer);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {ipList.map((ipDetails, index) => (
        <IPCard key={index} ipDetails={ipDetails} appState={appState} />
      ))}
    </div>
    // <div
    //   className="overflow-x-auto mt-8"
    //   style={{
    //     overflowX: "auto",
    //     width: "100vw",
    //     maxHeight: "100vh",
    //     padding: appState.isSmallScreen ? "0" : "0 20%",
    //   }}
    // >
    //   {/* <table className="table table-xs table-pin-rows table-pin-cols">
    //     <thead>
    //       <tr>
    //         <td>id</td>
    //         <td>Title</td>
    //         <td>description</td>
    //         <td>Type</td>
    //         <td>License</td>
    //         <td>Price</td>
    //         <td>Currency</td>
    //         <td>Created by</td>
    //         <th></th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {ipList.map((ip, index) => (
    //         <tr key={index}>
    //           <th style={{ width: "10%" }}>{Number(ip.id)}</th>
    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {ip.title}
    //           </td>
    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {ip.description}
    //           </td>

    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {Object.keys(ip.ipType)[0]}
    //           </td>
    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {Object.keys(ip.ipLicense)[0]}
    //           </td>
    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {ip.ipPrice}
    //           </td>
    //           <td
    //             style={{
    //               maxWidth: "8rem",
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //           >
    //             {ip.ipPriceCurrency}
    //           </td>
    //           <td
    //             style={{
    //               overflow: "hidden",
    //               textOverflow: "ellipsis",
    //             }}
    //             onClick={() => {
    //               navigator.clipboard.writeText(
    //                 Principal.fromUint8Array(ip.createdBy._arr).toText()
    //               );
    //             }}
    //           >
    //             {Principal.fromUint8Array(ip.createdBy._arr).toText()}
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table> */}
    // </div>
  );
};

export default IPListTable;
