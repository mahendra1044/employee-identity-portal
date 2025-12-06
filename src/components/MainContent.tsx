"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

export function MainContent({ children }: Props) {
  return <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">{children}</main>;
}

export default MainContent;
