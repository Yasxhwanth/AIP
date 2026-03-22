import type { Metadata } from "next";
import "./globals.css";
import { HealthProvider } from "@/components/HealthProvider";
import { AppShell } from "@/components/AppShell";

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
    <html lang="en" suppressHydrationWarning className="font-sans">
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
