import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VidyaSetu Web ERP',
  description: 'VidyaSetu school ERP portal for admin and principal operations',
  icons: {
    icon: '/branding/app-icon.png',
    apple: '/branding/app-icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en">
      <body>{children}</body>
      </html>
  );
}
