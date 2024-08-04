import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
} from "react";
import { redirect, useRouter } from "next/navigation";

interface MenuContextType {
  selectedMenuItem: string;
  setMenuAndNavigate: (name: string, path: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("Dashboard");

  const setMenuAndNavigate = (name: string, path: string) => {
    setSelectedMenuItem(name);
    console.log("adasda", path)
    router.push(path);
  };

  return (
    <MenuContext.Provider value={{ selectedMenuItem, setMenuAndNavigate }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
