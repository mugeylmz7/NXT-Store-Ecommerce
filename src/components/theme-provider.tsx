"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  
  // React 19 / Next.js 16.2+ script tag hatasını engellemek için:
  // next-themes'e script etiketinin tipini 'application/json' (çalıştırılamayan/zararsız) 
  // olarak sarmalamasını söylüyoruz. Böylece React 19 hata fırlatmayı kesiyor.
  const scriptProps = { type: "application/json" } as const;

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}