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
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px', // Defina o padding desejado aqui
          //paddingRight: '16px',
          marginLeft: '8px', // Defina o margin desejado aqui
          //marginRight: '0px',
        },
      },
    },
  },
});

export default theme;
