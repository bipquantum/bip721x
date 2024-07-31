import React, { useEffect, useState } from "react";
import IPListTable from "../../components/IPListTable";
import { backend } from "declarations/backend";
import { useDispatch, useSelector } from "react-redux";
import { create } from "../../store/IPReducer";
import { Box, CircularProgress } from "@mui/material";

const Home = () => {
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(true);
  const IPState = useSelector((reducers) => reducers.ipReducer);

  useEffect(() => {
    fetchAllIPs();
  }, []);

  const fetchAllIPs = async () => {
    const fetchedIPs = await backend.getAllIPs();
    dispatch(create({ list: fetchedIPs }));
    setFetching(false);
  };

  return (
    <Box
      sx={{ bgcolor: "background.default" }}
      style={{
        minHeight: "50vh",
      }}
    >
      {fetching ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <IPListTable ipList={IPState.ipList} />
      )}
    </Box>
  );
};

export default Home;
