import * as React from "react";
import { Box, Drawer, Toolbar, Divider, List, useTheme } from "@mui/material";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import CachedIcon from "@mui/icons-material/Cached";

import MenuItemComponent from "./MenuItem";
import { useMenu } from "@/context/MenuContext";
import { useRouter } from "next/navigation";

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Dashboard", icon: <LeaderboardIcon />, path: "/dashboard" },
  { name: "Converter Logs", icon: <CachedIcon />, path: "/conversor/" },
];

export default function Layout({ children }: LayoutProps) {
  const { selectedMenuItem, setMenuAndNavigate } = useMenu();

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        anchor="left"
      >
        <Toolbar sx={{ bgcolor: "primary.main" }}>
          <img alt="Logo" src="/logo_graviola.png" style={{ height: "40px" }} />
        </Toolbar>

        <Divider />
        <List>
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.name}
              name={item.name}
              icon={item.icon}
              path={item.path}
              isSelected={selectedMenuItem === item.name}
              onItemSelected={setMenuAndNavigate}
            />
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
