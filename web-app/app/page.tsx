import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Try going to /2022/[yourfid]
      <Link href={`/2022/1214`}>@df</Link>
      <Link href={`/2022/3`}>@dwr</Link>
    </main>
  );
}
