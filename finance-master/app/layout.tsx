'use client'
import "./globals.css";
import { ThemeSwitcher } from "./components/ThemesSwitcher";
import { ThemeProvider } from "next-themes";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme"
          defaultTheme="theme-bnc"
          enableSystem={false}
          themes={['theme-bnc', 'theme-desjardins', 'theme-scotia']}>
          <ThemeSwitcher />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
