import React, { createContext } from "react";

interface TranslationProviderProps extends React.PropsWithChildren {
  translate(text: string): string;
}

export const TranslationProvider = ({
  children,
  translate,
}: TranslationProviderProps) => (
  <TranslationContext.Provider value={translate}>
    {children}
  </TranslationContext.Provider>
);

export const TranslationContext = createContext((text: string) => text);
