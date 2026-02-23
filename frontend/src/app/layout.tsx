import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import {
  BarChart3,
  Map as MapIcon,
  Settings,
  Database,
  Activity,
  Network,
  Inbox,
  AlertTriangle,
  BrainCircuit,
  Terminal,
  Search,
  Clock,
  Folder
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "C3 AIP Workspace",
  description: "Artificial Intelligence Platform Ontology Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen flex overflow-hidden bg-[#f4f6f8] text-slate-900`}>

        {/* Extreme Left Global Navigation Sidebar (Dark) */}
        <aside className="w-14 bg-[#141b2d] flex flex-col items-center py-3 shrink-0 z-50 shadow-xl border-r border-[#0d121f]">
          {/* Top Icons */}
          <div className="flex flex-col gap-4 w-full items-center">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors">
              <div className="flex flex-col gap-[3px] w-4">
                <div className="h-px bg-current w-full"></div>
                <div className="h-px bg-current w-full"></div>
                <div className="h-px bg-current w-full"></div>
              </div>
            </button>
            <div className="w-6 h-px bg-slate-700/50 my-1"></div>
            <GlobalNavLink href="/" icon={<MapIcon className="w-4 h-4" />} active />
            <GlobalNavLink href="/search" icon={<Search className="w-4 h-4" />} />
            <GlobalNavLink href="/alerts" icon={<AlertTriangle className="w-4 h-4" />} />
          </div>

          {/* Middle Icons */}
          <div className="flex flex-col gap-3 w-full items-center mt-6">
            <GlobalNavLink href="/recent" icon={<Clock className="w-4 h-4" />} />
            <GlobalNavLink href="/files" icon={<Folder className="w-4 h-4" />} active />
            <GlobalNavLink href="/ontology" icon={<Network className="w-4 h-4" />} />
            <GlobalNavLink href="/models" icon={<BrainCircuit className="w-4 h-4" />} />
            <GlobalNavLink href="/integrations" icon={<BarChart3 className="w-4 h-4" />} />
          </div>

          {/* Bottom Icons */}
          <div className="mt-auto flex flex-col gap-3 w-full items-center">
            <GlobalNavLink href="/settings" icon={<Settings className="w-4 h-4" />} />
            <div className="w-8 h-8 mt-2 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-blue-500 cursor-pointer">
              YA
            </div>
          </div>
        </aside>

        {/* Main Content Area Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>

      </body>
    </html>
  );
}

// Global Nav Link Helper

function GlobalNavLink({ icon, href, active = false }: { icon: React.ReactNode, href: string, active?: boolean }) {
  return (
    <Link
      href={href}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all 
        ${active ? 'text-white bg-blue-600 shadow-[inset_2px_0_0_white]' : 'text-slate-400 hover:text-white hover:bg-white/10'}
      `}
    >
      {icon}
    </Link>
  )
}
