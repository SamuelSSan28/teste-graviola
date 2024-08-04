// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(2, 44, 34, 1)",
      dark: "#011e17",
    },
    secondary: {
      main: "#BEF264",
    },
  },
  typography: {
    fontFamily: "Arial",
    h1: {
      fontSize: "2rem",
    },
  },
});

export default theme;
