import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'JunTech — Thiệp cưới online đẹp nhất',
  description: 'Nền tảng thiệp cưới online hàng đầu Việt Nam. Hơn 50 mẫu thiệp đẹp, tuỳ chỉnh theo ý muốn, chia sẻ đến mọi người chỉ trong vài phút.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/*
          Load Google Fonts via plain <link> instead of `next/font/google` so
          the dev server keeps compiling even when the build machine cannot
          reach fonts.googleapis.com (firewall, slow network, offline). The
          browser still gets the same fonts at runtime.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
