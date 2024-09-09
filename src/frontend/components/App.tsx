import React, { useState } from "react";

import NavBar from "./NavBar";
import SideBar from "./SideBar";
import Dashboard from "./Dashboard";
import NewIP from "./NewIP";
import Copyright from "./Copyright";
import Profile from "./Profile";
import Bips from "./Bips";

function App() {
  const [selectedItem, setSelectedItem] = useState("dashboard");
  return (
    <div className="flex min-h-screen w-full">
      <NavBar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      {selectedItem !== "bips" && <SideBar />}

      {selectedItem === "dashboard" && <Dashboard />}
      {selectedItem === "new" && <NewIP />}
      {selectedItem === "copyright" && <Copyright />}
      {selectedItem === "profile" && <Profile />}
      {selectedItem === "bips" && <Bips />}
    </div>
  );
}

export default App;
