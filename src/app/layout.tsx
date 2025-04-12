import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import ClientLayoutShell from './ClientLayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Story IP',
  description: 'Manage your digital assets with Story Protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#f8f9fc' }}>
        <Providers>
          <ClientLayoutShell>
            {children}
          </ClientLayoutShell>
        </Providers>
      </body>
    </html>
  );
}