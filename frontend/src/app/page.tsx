"use client";

import Link from "next/link";
import {
  Database,
  Network,
  AlertTriangle,
  Map as MapIcon,
  Activity,
  BrainCircuit,
  Inbox,
  Terminal,
  Settings,
  Flame
} from "lucide-react";

export default function Home() {
  return (
    <div className="h-full w-full flex bg-white text-slate-900 border-t border-slate-200">

      {/* Contextual Page Sidebar (Left) */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col pt-6 shrink-0 h-full overflow-y-auto hidden md:flex">

        {/* Large Brand Icon */}
        <div className="px-6 mb-8">
          <div className="w-full aspect-square bg-[#fb923c] rounded-xl flex items-center justify-center inset-0 bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-md border border-[#c2410c] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <Flame className="w-24 h-24 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2">Navigation</h3>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left px-3 py-1.5 text-sm font-semibold text-slate-900 bg-slate-200/50 rounded flex items-center group">
                <span className="w-0 overflow-hidden group-hover:w-2 transition-all">▸</span> Applications for Data Ops
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded flex items-center group transition-colors">
                <span className="w-0 overflow-hidden group-hover:w-2 transition-all">▸</span> Applications for Analytics
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded flex items-center group transition-colors">
                <span className="w-0 overflow-hidden group-hover:w-2 transition-all">▸</span> Applications for Operations
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Page Content (Right) */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Welcome Banner */}
          <div className="w-full bg-blue-600 rounded-xl p-8 text-white shadow-sm border border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 relative overflow-hidden">
            {/* Decorative graphic element on right edge similar to reference */}
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/10 skew-x-12 translate-x-16"></div>
            <div className="relative z-10">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">👋</span> Welcome to C3 AIP.
              </h1>
              <p className="mt-2 text-blue-100 text-sm max-w-2xl leading-relaxed">
                AIP is an enterprise AI application platform built for powerful data ontology transformations, analytics, and data-driven decision-making.
              </p>
            </div>
          </div>

          {/* App Categories */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Applications for Data Ops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AppCard
                href="/integrations"
                icon={<Database />}
                title="Data Integration"
                description="Clean, parse, and unite raw data"
              />
              <AppCard
                href="/ontology"
                icon={<Network />}
                title="Ontology Builder"
                description="Deploy object schemas & relationships"
              />
              <AppCard
                href="/alerts"
                icon={<AlertTriangle />}
                title="Alerts & Policies"
                description="Manage operational rule pipelines"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Applications for Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AppCard
                href="/geo"
                icon={<MapIcon />}
                title="GeoExplorer"
                description="Time-travel spatial visualization"
              />
              <AppCard
                href="/telemetry"
                icon={<Activity />}
                title="Telemetry"
                description="Explore real-time time series data"
              />
              <AppCard
                href="/models"
                icon={<BrainCircuit />}
                title="Model Registry"
                description="Manage and deploy ML models"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Applications for Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AppCard
                href="/inbox"
                icon={<Inbox />}
                title="Decision Inbox"
                description="Human-in-the-loop triage queue"
              />
              <AppCard
                href="/console"
                icon={<Terminal />}
                title="Developer Console"
                description="API logs and platform diagnostics"
              />
              <AppCard
                href="/settings"
                icon={<Settings />}
                title="Workspace Settings"
                description="Manage access controls and platform config"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AppCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href} className="group flex items-center p-3 bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors mr-4">
        <div className="w-5 h-5">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 pr-2">{description}</p>
      </div>
    </Link>
  )
}
