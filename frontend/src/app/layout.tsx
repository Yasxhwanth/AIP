import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import WorkspaceGuard from "@/components/WorkspaceGuard";
export const metadata: Metadata = {
  title: " AIP Workspace",
  description: "Artificial Intelligence Platform Ontology Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex overflow-hidden bg-black text-slate-100 font-sans" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

        {/* Extracted Client Sidebar */}
        <Sidebar />

        {/* Main Content Area Wrapper Protected by Workspace Context */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <WorkspaceGuard>
            {children}
          </WorkspaceGuard>
        </div>

      </body>
    </html>
  );
}


