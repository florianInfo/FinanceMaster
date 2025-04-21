import '@/styles/globals.css';
import { ThemeProvider } from 'next-themes';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {

  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider attribute="data-theme" defaultTheme="dark-red" enableSystem={false}>
            <TransactionsProvider>
              <CurrencyProvider>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex flex-col flex-1">
                    <Topbar />
                    <main className="p-4 overflow-auto flex-1">{children}</main>
                  </div>
                </div>
              </CurrencyProvider>
            </TransactionsProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}