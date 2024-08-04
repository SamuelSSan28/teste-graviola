import * as React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

interface MenuItemProps {
  name: string;
  icon: React.ReactElement;
  isSelected: boolean;
  path: string;
  onItemSelected: (name: string, path: string) => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({
  name,
  icon,
  isSelected,
  path,
  onItemSelected,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{
          "&:hover": {
            backgroundColor: isSelected ? "#1b4138" : "rgba(0, 0, 0, 0.1)", // Escurece para o selecionado no hover
            "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
              color: isSelected ? "secondary.main" : "primary.main", // Mantém contraste ou muda para verde
            },
          },
          ...(isSelected && {
            backgroundColor: "primary.main",
            "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
              color: "secondary.main",
            },
          }),
        }}
        onClick={() => onItemSelected(name, path)}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={name} />
      </ListItemButton>
    </ListItem>
  );
};

export default MenuItemComponent;
