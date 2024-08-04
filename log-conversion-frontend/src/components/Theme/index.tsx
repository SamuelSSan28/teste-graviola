"use client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme/theme";
import Layout from "../Layout";
import { MenuProvider } from "@/context/MenuContext";
 

export default function Theme({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider theme={theme}>
      <MenuProvider>
        <CssBaseline />
        <Layout>{children}</Layout>{" "}
      </MenuProvider>
    </ThemeProvider>
  );
}
