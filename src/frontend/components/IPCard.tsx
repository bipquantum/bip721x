import * as React from "react";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";

const IPCard = ({ ipDetails, appState }) => {
  return (
    <Box
      sx={{
        width: appState.isSmallScreen ? "90%" : "60%",
        position: "relative",
        overflow: { xs: "auto", sm: "initial" },
        marginBottom: "1rem",
      }}
    >
      <Card
        orientation="horizontal"
        sx={{
          width: "100%",
          flexWrap: "wrap",
          [`& > *`]: {
            "--stack-point": "500px",
            minWidth:
              "clamp(0px, (calc(var(--stack-point) - 2 * var(--Card-padding) - 2 * var(--variant-borderWidth, 0px)) + 1px - 100%) * 999, 100%)",
          },
          // make the card resizable for demo
          overflow: "auto",
          resize: "horizontal",
        }}
      >
        <CardContent>
          <Typography fontSize="xl" fontWeight="lg">
            {ipDetails.title}
          </Typography>
          <Typography level="body-sm" fontWeight="lg" textColor="text.tertiary">
            {ipDetails.description}
          </Typography>
          <Sheet
            sx={{
              bgcolor: "background.level1",
              borderRadius: "sm",
              p: 1.5,
              my: 1.5,
              display: "flex",
              gap: 2,
              "& > div": { flex: 1 },
            }}
          >
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Currency
              </Typography>
              <Typography fontWeight="lg">
                {ipDetails.ipPriceCurrency}
              </Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Price
              </Typography>
              <Typography fontWeight="lg">{ipDetails.ipPrice}</Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Type
              </Typography>
              <Typography fontWeight="lg">
                {Object.keys(ipDetails.ipType)[0]}
              </Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                License
              </Typography>
              <Typography fontWeight="lg">
                {Object.keys(ipDetails.ipLicense)[0]}
              </Typography>
            </div>
          </Sheet>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              "& > button": { flex: 1 },
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "#888",
                }}
              >
                Created By
              </span>
              <span
                style={{
                  fontSize: appState.isSmallScreen ? ".9rem" : "1rem",
                }}
              >
                {ipDetails.createdBy.toText()}
              </span>
            </div>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IPCard;
