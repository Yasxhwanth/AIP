import type { Metadata } from "next";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import { HealthProvider } from "@/components/HealthProvider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "AIP Command Center",
  description: "Enterprise Mission Control and Data Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body suppressHydrationWarning className="antialiased min-h-screen w-full flex flex-col overflow-hidden bg-pt-bg text-pt-text selection:bg-pt-intent-primary/30 font-sans">
        <HealthProvider>
          <AppShell>
            {children}
          </AppShell>
        </HealthProvider>
      </body>
    </html>
  );
}
