'use client';

import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';

import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { useFinanceStore } from '@/store/financeStore';
import Navigation from '@/components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings } = useFinanceStore();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider forceColorScheme={settings?.theme || 'light'}>
          <Navigation>
            {children}
          </Navigation>
        </MantineProvider>
      </body>
    </html>
  )
}