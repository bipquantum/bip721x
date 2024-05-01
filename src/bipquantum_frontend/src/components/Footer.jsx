import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import FacebookIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/X";
import { useSelector } from "react-redux";

export default function Footer() {
  const appState = useSelector((states) => states.appReducer);
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: { xs: "100%", sm: "60%" },
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
            <Box
              sx={{ ml: "-15px" }}
              style={{
                ...(appState.isSmallScreen
                  ? {
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: ".5rem",
                      marginLeft: ".3rem",
                    }
                  : {}),
                fontWeight: "bold",
                color: "grey",
                fontSize: "1.4rem",
              }}
            >
              BIPQuantum
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        ></Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        ></Box>
        <Box
          sx={{
            display: { xs: "flex", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Stack
            direction="row"
            justifyContent={appState.isSmallScreen ? "center" : "left"}
            spacing={1}
            useFlexGap
            sx={{
              color: "text.secondary",
            }}
          >
            <IconButton
              color="inherit"
              // href="https://github.com/mui"
              aria-label="GitHub"
              sx={{ alignSelf: "center" }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              color="inherit"
              // href="https://twitter.com/MaterialUI"
              aria-label="X"
              sx={{ alignSelf: "center" }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              color="inherit"
              // href="https://www.linkedin.com/company/mui/"
              aria-label="LinkedIn"
              sx={{ alignSelf: "center" }}
            >
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
