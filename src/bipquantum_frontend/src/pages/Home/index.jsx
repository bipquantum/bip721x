import React, { useEffect } from "react";
import IPListTable from "../../components/IPListTable";
import { bipquantum_backend } from "declarations/bipquantum_backend";
import { useDispatch, useSelector } from "react-redux";
import { create } from "../../store/IPReducer";

const Home = () => {
  const dispatch = useDispatch();
  const IPState = useSelector((reducers) => reducers.ipReducer);

  useEffect(() => {
    fetchAllIPs();
  }, []);

  const fetchAllIPs = async () => {
    const fetchedIPs = await bipquantum_backend.getAllIPs();
    dispatch(create({ list: fetchedIPs }));
  };

  return (
    <div
      style={{
        marginBottom: "auto",
        minHeight: "74vh",
        width: "100%",
        marginTop: "5rem",
        display: "flex",
        justifyContent: "center",
        marginLeft: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <IPListTable ipList={IPState.ipList} />
      </div>
    </div>
  );
};

export default Home;
