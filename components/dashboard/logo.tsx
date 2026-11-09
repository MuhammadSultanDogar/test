"use client";

import { useState } from "react";

// Static assets are not auto-prefixed with basePath when using a plain <img>.
const LOGO_SRC = "/capacity/logo.svg";

export function Logo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="flex h-12 shrink-0 items-center rounded-sm bg-destructive px-3 font-heading text-lg font-bold tracking-wider text-destructive-foreground">
        {"O'DONNELL"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="O'Donnell Metal Deck & Bar Joist"
      width={120}
      height={48}
      className="h-12 w-auto shrink-0"
      onError={() => setFailed(true)}
    />
  );
}
