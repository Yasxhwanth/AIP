import type { Metadata } from "next";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Palantir AIP",
  description: "Enterprise Data Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased min-h-screen w-full flex flex-col overflow-hidden bg-pt-bg text-pt-text text-[13px]">
        {/* Global Command Palette (Cmd+K) */}
        <CommandPalette />
        <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative w-full">
          <Sidebar />
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
