'use client';

import './globals.css';
import { ThemeProvider } from 'next-themes';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { TransactionsProvider } from './contexts/TransactionsContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark-red"
          enableSystem={false}
          themes={['dark-red', 'light-red', 'dark-green', 'light-green']}
        >
          <TransactionsProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar rétractable */}
              <Sidebar />

              {/* Contenu principal */}
              <div className="flex flex-col flex-1">
                {/* Topbar avec langue / thème / export-import */}
                <Topbar />

                {/* Page content */}
                <main className="p-4 overflow-auto flex-1">{children}</main>
              </div>
            </div>
          </TransactionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
