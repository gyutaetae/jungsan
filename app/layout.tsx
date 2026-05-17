import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정산",
  description:
    "소상공인과 프리랜서를 위한 영수증·거래내역 정리 및 간편장부 초안 생성 웹 MVP",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
