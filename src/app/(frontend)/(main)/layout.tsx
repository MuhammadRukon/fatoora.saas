import { Container } from "@/components/container/container";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Container>{children}</Container>;
}
