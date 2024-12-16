import React, { createContext, useContext, ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";

type SizeContextType = {
  size: "xs" | "sm";
  sizeButton: "compact-xs" | "xs";
  sizeTitle: string;
  sizeActionButton: number;
  fullWidth: boolean;
  heightDropdown: number;
};

const SizeContext = createContext<SizeContextType | undefined>(undefined);

type SizeProviderProps = {
  children: ReactNode;
};

export const SizeProvider: React.FC<SizeProviderProps> = ({ children }) => {
  const isSmall = useMediaQuery("(max-width: 768px)");

  const size = isSmall ? "xs" : "sm";
  const sizeButton = isSmall ? "compact-xs" : "xs";
  const sizeTitle = isSmall ? "1rem" : "1.5rem";
  const sizeActionButton = isSmall ? 100 : 16;
  const fullWidth = isSmall ? true : false;
  const heightDropdown = isSmall ? 200 : 300;

  const value: SizeContextType = {
    size,
    sizeButton,
    sizeTitle,
    sizeActionButton,
    fullWidth,
    heightDropdown,
  };

  return <SizeContext.Provider value={value}>{children}</SizeContext.Provider>;
};

export const useSizes = (): SizeContextType => {
  const context = useContext(SizeContext);
  if (!context) {
    throw new Error("useSizes must be used within a SizeProvider");
  }
  return context;
};
