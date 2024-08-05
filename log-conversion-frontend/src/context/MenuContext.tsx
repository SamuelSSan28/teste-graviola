import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FunctionComponent,
} from "react";
import { useRouter } from "next/navigation";

interface MenuContextType {
  selectedMenuItem: string;
  setMenuAndNavigate: (name: string, path: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");

  useEffect(() => {
    // Assegure que o código é executado no lado do cliente
    const pathToMenuItem: { [key: string]: string } = {
      "/dashboard": "Dashboard",
      "/conversor": "Converter Logs",
    };

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const menuItem = pathToMenuItem[currentPath];
      setSelectedMenuItem(menuItem);
    }
  }, []);

  const setMenuAndNavigate = (name: string, path: string) => {
    router.push(path);
    setSelectedMenuItem(name);
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
