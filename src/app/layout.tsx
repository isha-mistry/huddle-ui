import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HuddleContextProvider from "@/context/HuddleContextProvider";
import { Web3Modal } from "@/context/Web3Modal";

export const metadata: Metadata = {
  title: "Health01",
  description: "Studio to record podcasts and videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Modal>
          <HuddleContextProvider>{children}</HuddleContextProvider>
        </Web3Modal>
      </body>
    </html>
  );
}
