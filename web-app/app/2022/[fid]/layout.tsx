"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Chakra } from "./chakra";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Chakra cookies={""}>{children}</Chakra>;
}
