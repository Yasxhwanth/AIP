"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database, Network, AlertTriangle, Map as MapIcon, Activity,
  BrainCircuit, Inbox, Terminal, Settings, GitMerge, Search,
  TrendingUp, Zap, Clock, CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";

interface KPIStat {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

interface DomainEvent {
  id: string;
  eventType: string;
  logicalId: string;
  occurredAt: string;
  payload: any;
}

function KPITile({ stat }: { stat: KPIStat }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 transition-all hover:border-white/15"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
          {stat.icon}
        </div>
      </div>
      <div>
        {stat.loading ? (
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        ) : (
          <div className="text-2xl font-bold text-white">{stat.value}</div>
        )}
        {stat.sub && <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: DomainEvent }) {
  const typeColors: Record<string, string> = {
    EntityStateChanged: "text-cyan-400 bg-cyan-400/10",
    AlertTriggered: "text-amber-400 bg-amber-400/10",
    DecisionExecuted: "text-emerald-400 bg-emerald-400/10",
  };
  const colorClass = typeColors[event.eventType] ?? "text-slate-400 bg-slate-400/10";
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
        {event.eventType}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-mono text-xs text-slate-300 truncate">{event.logicalId}</span>
      </div>
      <div className="shrink-0 text-[10px] text-slate-500">
        {new Date(event.occurredAt).toLocaleTimeString()}
      </div>
    </div>
  );
}

function AppCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-cyan-500/30"
      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="w-5 h-5">{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [kpiLoading, setKpiLoading] = useState(true);
  const [entityTypeCount, setEntityTypeCount] = useState(0);
  const [instanceCount, setInstanceCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function loadKpis() {
      try {
        const [etypes, instances, alerts, models] = await Promise.allSettled([
          ApiClient.get<any[]>("/entity-types"),
          ApiClient.get<any[]>("/api/v1/ontology/instances/current"),
          ApiClient.get<any[]>("/api/v1/alerts"),
          ApiClient.get<any[]>("/api/v1/models"),
        ]);
        if (etypes.status === "fulfilled") setEntityTypeCount(etypes.value.length);
        if (instances.status === "fulfilled") setInstanceCount(instances.value.length);
        if (alerts.status === "fulfilled") setAlertCount(alerts.value.filter((a: any) => !a.acknowledged).length);
        if (models.status === "fulfilled") setModelCount(models.value.length);
      } catch {/* ignore */ } finally {
        setKpiLoading(false);
      }
    }
    async function loadEvents() {
      try {
        const data = await ApiClient.get<DomainEvent[]>("/api/v1/events/recent");
        setEvents(data.slice(0, 12));
      } catch {/* ignore */ } finally {
        setEventsLoading(false);
      }
    }
    loadKpis();
    loadEvents();
  }, []);

  const kpis: KPIStat[] = [
    {
      label: "Entity Types",
      value: entityTypeCount,
      sub: "Ontology schemas",
      icon: <Network className="w-4 h-4" />,
      color: "bg-indigo-500/15 text-indigo-400",
      loading: kpiLoading,
    },
    {
      label: "Active Instances",
      value: instanceCount,
      sub: "CQRS read model",
      icon: <Database className="w-4 h-4" />,
      color: "bg-cyan-500/15 text-cyan-400",
      loading: kpiLoading,
    },
    {
      label: "Open Alerts",
      value: alertCount,
      sub: "Unacknowledged",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: alertCount > 0 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400",
      loading: kpiLoading,
    },
    {
      label: "AI Models",
      value: modelCount,
      sub: "In registry",
      icon: <BrainCircuit className="w-4 h-4" />,
      color: "bg-purple-500/15 text-purple-400",
      loading: kpiLoading,
    },
  ];

  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{ background: "linear-gradient(180deg,#070b14 0%,#050910 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

        {/* Welcome banner */}
        <div
          className="w-full rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(37,99,235,0.15) 100%)",
            border: "1px solid rgba(6,182,212,0.2)",
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10"
            style={{ background: "linear-gradient(90deg, transparent, #06b6d4)", transform: "skewX(12deg) translateX(32px)" }} />
          <div className="relative z-10">
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">👋</span> Welcome to C3 AIP.
            </h1>
            <p className="mt-1 text-cyan-200/60 text-sm max-w-2xl">
              Enterprise AI Application Platform — ontology-first data unification, multi-source entity resolution, and decision intelligence.
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Platform Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map(k => <KPITile key={k.label} stat={k} />)}
          </div>
        </section>

        {/* Main grid: app cards + event feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: app catalog */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Data Operations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AppCard href="/integrations" icon={<Database />} title="Data Integration" description="Ingest CSV, JSON, REST APIs" />
                <AppCard href="/ontology" icon={<Network />} title="Ontology Builder" description="Manage object types & relationships" />
                <AppCard href="/resolve" icon={<GitMerge />} title="Identity Resolution" description="Multi-source entity deduplication" />
                <AppCard href="/alerts" icon={<AlertTriangle />} title="Alerts & Policies" description="Event-driven rule engine" />
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Analytics & Intelligence</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AppCard href="/workshop" icon={<Search />} title="Workshop" description="Global object search & discovery" />
                <AppCard href="/geo" icon={<MapIcon />} title="Geo Intel" description="Spatial visualization with ontology overlay" />
                <AppCard href="/telemetry" icon={<Activity />} title="Telemetry" description="Real-time time-series explorer" />
                <AppCard href="/models" icon={<BrainCircuit />} title="AI Model Registry" description="Model versions & inference engine" />
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Operations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AppCard href="/inbox" icon={<Inbox />} title="Decision Inbox" description="Human-in-the-loop triage queue" />
                <AppCard href="/settings" icon={<Settings />} title="Settings" description="API keys, auth, workspace config" />
              </div>
            </div>
          </div>

          {/* Right: recent events feed */}
          <div className="lg:col-span-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Domain Events</h2>
            <div
              className="rounded-xl border h-full min-h-[300px] flex flex-col"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400">Live Event Stream</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {eventsLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2">
                    <Clock className="w-6 h-6 text-slate-600" />
                    <p className="text-xs text-slate-500">No events yet. Ingest data to see activity.</p>
                  </div>
                ) : (
                  events.map(e => <EventRow key={e.id} event={e} />)
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
