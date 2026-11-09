import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="O'Donnell Metal Deck"
      width={191}
      height={78}
      priority
      className="h-12 w-auto shrink-0 mix-blend-multiply md:h-14"
    />
  );
}
