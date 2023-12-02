"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [fid, setFid] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>Farcaster wrapped 2022</p>
      <input
        value={fid}
        onChange={(e) => setFid(e.currentTarget.value)}
        placeholder="Put your fid here"
      />
      <Link href={`/2022/${fid}`}>Go</Link>
      <p>
        Example: <Link href={`/2022/1214`}>@df</Link>
      </p>
    </main>
  );
}
