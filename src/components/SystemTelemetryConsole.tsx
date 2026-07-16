import React, { useState } from "react";
import { useStore, SystemLog } from "../store/useStore";
import { Card, Button, Input, Select, Badge, getAccentClass } from "./UI";
import { Terminal, Send, Trash2, ShieldCheck, ShieldAlert, FileSearch, ArrowUpRight, Cpu } from "lucide-react";

export const SystemTelemetryConsole: React.FC = () => {
  const { logs, clearLogs, addLog } = useStore();
  const [customEndpoint, setCustomEndpoint] = useState("/api/v1/payments/gateways");
  const [customMethod, setCustomMethod] = useState<"GET" | "POST" | "DELETE">("GET");
  const [customPayload, setCustomPayload] = useState("{\n  \"providerId\": \"stripe\",\n  \"status\": \"active\"\n}");
  const [loading, setLoading] = useState(false);
  const [responseView, setResponseView] = useState<any>(null);

  const handleTestAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseView(null);
    try {
      const options: RequestInit = {
        method: customMethod,
        headers: { "Content-Type": "application/json" }
      };
      if (customMethod !== "GET") {
        options.body = customPayload;
      }

      const res = await fetch(customEndpoint, options);
      const data = await res.json();
      
      // Push to Zustand log stream
      addLog({
        method: customMethod,
        endpoint: customEndpoint,
        status: res.status,
        type: "api",
        payload: customMethod !== "GET" ? JSON.parse(customPayload) : undefined,
        response: data
      });

      setResponseView(data);
    } catch (err: any) {
      const errorLog = { error: "Failed to dispatch API action", message: err.message };
      addLog({
        method: customMethod,
        endpoint: customEndpoint,
        status: 500,
        type: "api",
        response: errorLog
      });
      setResponseView(errorLog);
    } finally {
      setLoading(false);
    }
  };

  const activeMethodColor = (method: string) => {
    if (method === "GET") return "text-emerald-400 bg-emerald-950/30 border-emerald-900/20";
    if (method === "POST") return "text-indigo-400 bg-indigo-950/30 border-indigo-900/20";
    return "text-rose-400 bg-rose-950/30 border-rose-900/20";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive API Client Playground */}
      <Card className="p-6 lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <span className={`p-1.5 rounded-lg ${getAccentClass("bg")} text-white`}>
            <Cpu className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">API Sandbox Gateway</h4>
            <p className="text-3xs text-zinc-500">Dispatch live requests to Exshopi AI endpoints</p>
          </div>
        </div>

        <form onSubmit={handleTestAPI} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Select
                label="Method"
                value={customMethod}
                onChange={(e: any) => setCustomMethod(e.target.value)}
                options={[
                  { value: "GET", label: "GET" },
                  { value: "POST", label: "POST" },
                  { value: "DELETE", label: "DELETE" }
                ]}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Endpoint / URI"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                required
              />
            </div>
          </div>

          {customMethod !== "GET" && (
            <div className="space-y-1.5">
              <label className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">Request Body (JSON)</label>
              <textarea
                className="w-full bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 p-3 rounded-lg focus:outline-none min-h-[100px]"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
              />
            </div>
          )}

          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-850 space-y-1 text-2xs text-zinc-500">
            <span className="font-semibold text-zinc-400 block mb-1">🔗 Preset Enterprise Foundation Routes:</span>
            <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/payments/gateways"); setCustomMethod("GET"); }}>
              • GET `/api/v1/payments/gateways`
            </div>
            <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/logistics/carriers"); setCustomMethod("GET"); }}>
              • GET `/api/v1/logistics/carriers`
            </div>
            <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/security/anomalies"); setCustomMethod("GET"); }}>
              • GET `/api/v1/security/anomalies`
            </div>
            <div className="cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => { setCustomEndpoint("/api/v1/reports"); setCustomMethod("GET"); }}>
              • GET `/api/v1/reports`
            </div>
          </div>

          <Button variant="primary" className="w-full" type="submit" loading={loading} icon={<Send className="h-4 w-4" />}>
            Dispatch Live Endpoint Request
          </Button>
        </form>

        {responseView && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
            <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">Sandbox API Response Output</span>
            <pre className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-lg font-mono text-2xs text-emerald-400 overflow-x-auto max-h-52">
              {JSON.stringify(responseView, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Live Logging Telemetry Terminal */}
      <Card className="p-6 lg:col-span-2 flex flex-col h-[520px]">
        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-850 text-zinc-400 animate-pulse">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Live Client-Server Telemetry Logs</h4>
              <p className="text-3xs text-zinc-500">Real-time HTTP requests, Security sensors & webhook events</p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={clearLogs}>
            Clear Buffer
          </Button>
        </div>

        {/* Console view */}
        <div className="flex-1 bg-black/50 border border-zinc-850 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3.5 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs gap-2">
              <Cpu className="h-4 w-4 animate-spin" />
              <span>Awaiting workspace platform API request events...</span>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-2xs mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-zinc-600 font-semibold">{log.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${activeMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                    <span className="text-zinc-300 font-medium break-all">{log.endpoint}</span>
                  </div>
                  <div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.status >= 200 && log.status < 300
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                        : "bg-rose-950/40 text-rose-400 border-rose-900/30"
                    }`}>
                      STATUS {log.status}
                    </span>
                  </div>
                </div>

                {log.payload && (
                  <div className="text-[11px] text-zinc-500 pl-4 mt-1">
                    <span className="text-zinc-600 font-semibold">Payload: </span>
                    <span className="text-zinc-400 break-all">{JSON.stringify(log.payload)}</span>
                  </div>
                )}

                {log.response && (
                  <div className="text-[11px] text-zinc-500 pl-4 mt-0.5">
                    <span className="text-zinc-600 font-semibold">Response: </span>
                    <span className="text-emerald-500/90 break-all">{JSON.stringify(log.response)}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SOC-2 Audit Controls Mapping */}
      <Card className="p-6 lg:col-span-3">
        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">SOC-2 / PCI-DSS Security Compliance Checklist</h4>
              <p className="text-3xs text-zinc-500">Enterprise security parameters mapped to workspace structural controls</p>
            </div>
          </div>
          <Badge variant="accent">Fully Audited (v1.0.0)</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold text-indigo-400">CC6.1 ACCESS CONTROLS</span>
              <span className="text-emerald-400 text-3xs font-mono font-bold flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Enforce scoped cryptographic keys and robust role-based access controls across all REST router targets.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold text-indigo-400">CC6.3 MULTI-FACTOR AUTH</span>
              <span className="text-emerald-400 text-3xs font-mono font-bold flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Require dual-vector TOTP authentication for admin credentials with dynamic session lease timeout mechanisms.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono font-bold text-indigo-400">CC7.1 ANOMALY DETECTION</span>
              <span className="text-emerald-400 text-3xs font-mono font-bold flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Live threat sensor logging blocks brute force, impossible travel vectors, and malicious rate limits automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
