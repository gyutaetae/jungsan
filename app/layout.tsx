import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정산",
  description: "영수증과 거래내역을 검토 가능한 간편장부 초안으로 바꾸는 웹 MVP",
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
