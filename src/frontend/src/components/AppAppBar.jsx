import * as React from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import ii from "../assets/dfinity.svg";
import { Copy, LogOut, User } from "react-feather";
import profile from "../assets/profile.png";
import { useInternetIdentity } from "@internet-identity-labs/react-ic-ii-auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const logoStyle = {
  width: "140px",
  height: "auto",
  cursor: "pointer",
};

function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const { signout, isAuthenticated, authenticate, identity } =
    useInternetIdentity();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((reducers) => reducers.authReducer);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

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

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: 2,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          variant="regular"
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderRadius: "999px",
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(24px)",
            maxHeight: 40,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              theme.palette.mode === "light"
                ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                : "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
          })}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              ml: "-18px",
              px: 0,
            }}
          >
            <span
              style={{
                color: "grey",
                fontWeight: "bold",
                margin: "0 1rem",
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              BIPQuantum
            </span>
            {/* <img
                src={
                  "https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e6faf73568658154dae_SitemarkDefault.svg"
                }
                style={logoStyle}
                alt="logo of sitemark"
              /> */}
            <Box
              sx={{ display: { xs: "none", md: "flex" } }}
              style={{
                marginLeft: "auto",
                // marginRight: "auto",
              }}
            >
              {isAuthenticated && (
                <MenuItem
                  // onClick={() => scrollToSection("features")}
                  sx={{ py: "6px", px: "12px" }}
                  onClick={() => navigate("/ip/create")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    style={{
                      color: "#007BA7",
                      fontWeight: "bold",
                      marginBottom: ".1rem",
                      marginRight: ".3rem",
                    }}
                  >
                    Create IP
                  </Typography>
                </MenuItem>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              alignItems: "center",
            }}
          >
            {isAuthenticated ? (
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
                      color: "black",
                    }}
                  >
                    {hexRepresentation(identity.getPrincipal().toText())}
                  </span>
                </button>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content rounded-box w-56"
                  style={{
                    background: "#f1f1f1",
                  }}
                >
                  <li>
                    <a
                      className="flex justify-between"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          identity.getPrincipal().toText()
                        );
                      }}
                    >
                      <Copy
                        size={"1rem"}
                        style={{
                          color: "black",
                        }}
                      />
                      <span
                        className="mr-auto text-black"
                        style={{
                          color: "black",
                        }}
                      >
                        Principal ID:{" "}
                        {hexRepresentation(identity.getPrincipal().toText())}
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex justify-between"
                      onClick={() => navigate("/profile")}
                    >
                      <User
                        size={"1rem"}
                        style={{
                          color: "black",
                        }}
                      />
                      <span
                        className="mr-auto text-black"
                        style={{
                          color: "black",
                        }}
                      >
                        Profile
                      </span>
                    </a>
                  </li>
                  <li onClick={() => signoutHandler()}>
                    <a className="flex justify-between">
                      <LogOut
                        size={"1rem"}
                        style={{
                          color: "black",
                        }}
                      />
                      <span
                        className="mr-auto text-black!"
                        style={{
                          color: "black",
                        }}
                      >
                        Disconnect
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              // <button
              //   className="flex mr-8 items-center"
              //   onClick={() => navigate("/profile")}
              // >
              //   <img
              //     src={profile}
              //     alt="profile"
              //     style={{
              //       width: "1.8rem",
              //       borderRadius: "50%",
              //       marginRight: ".5rem",
              //     }}
              //   />
              //   <span
              //     className="text-white"
              //     style={{
              //       fontSize: "1rem",
              //       color: "black",
              //     }}
              //   >
              //     {hexRepresentation(identity.getPrincipal().toText())}
              //   </span>
              // </button>
              <Button
                color="primary"
                variant="text"
                size="small"
                component="a"
                target="_blank"
                style={{
                  color: "#007BA7",
                  fontWeight: "bold",
                }}
                onClick={authenticate}
              >
                Connect
                <img src={ii} alt="ii-img" width={"30px"} className="ml-2" />
              </Button>
            )}
          </Box>
          <Box sx={{ display: { sm: "", md: "none" } }}>
            <Button
              variant="text"
              color="primary"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ minWidth: "30px", p: "4px" }}
            >
              <MenuIcon />
            </Button>
            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#777",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  margin: ".8rem 0",
                }}
              >
                BIPQuantum
              </div>
              <Divider />
              <Box
                sx={{
                  minWidth: "60dvw",
                  p: 2,
                  backgroundColor: "background.paper",
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexGrow: 1,
                  }}
                  onClick={() => navigate("/profile")}
                >
                  {isAuthenticated && (
                    <MenuItem
                      style={{
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Profile
                    </MenuItem>
                  )}
                </Box>
                {/* {isAuthenticated && <Divider />} */}
                {isAuthenticated ? (
                  <MenuItem
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Button
                      color="error"
                      variant="text"
                      component="a"
                      target="_blank"
                      sx={{ width: "100%" }}
                      onClick={() => signoutHandler()}
                    >
                      Disconnect
                    </Button>
                  </MenuItem>
                ) : (
                  <MenuItem
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Button
                      color="primary"
                      variant="text"
                      component="a"
                      target="_blank"
                      sx={{ width: "100%" }}
                      onClick={authenticate}
                    >
                      Connect with II
                      <img
                        src={ii}
                        alt="ii-img"
                        width={"30px"}
                        className="ml-2"
                      />
                    </Button>
                  </MenuItem>
                )}
                {/* <MenuItem>
                    <Button
                      color="primary"
                      variant="outlined"
                      component="a"
                      href="/material-ui/getting-started/templates/sign-in/"
                      target="_blank"
                      sx={{ width: "100%" }}
                    >
                      Sign in
                    </Button>
                  </MenuItem> */}
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(["dark", "light"]).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;
