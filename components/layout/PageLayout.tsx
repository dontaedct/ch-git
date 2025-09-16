/**
 * @fileoverview Page Layout Component
 * Consistent page layout wrapper
 */
"use client";

import { ReactNode } from "react";
import MainNavigation from "../navigation/MainNavigation";

interface PageLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export default function PageLayout({
  children,
  showNavigation = true,
  className = ""
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {showNavigation && <MainNavigation />}
      <main className={`${className}`}>
        {children}
      </main>
    </div>
  );
}