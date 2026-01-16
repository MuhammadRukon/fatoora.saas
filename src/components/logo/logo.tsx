import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="Logo">
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
    </Link>
  );
}
