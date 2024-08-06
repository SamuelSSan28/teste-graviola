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
          paddingLeft: '24px', // Defina o padding desejado aqui
          paddingRight: '24px',
          '@media (min-width: 600px)': {
            paddingLeft: '16px', // Define para tamanhos de tela maiores
            paddingRight: '16px',
          },
        },
      },
    },
  },
});

export default theme;
