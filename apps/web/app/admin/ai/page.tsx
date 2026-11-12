"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SafeCredential {
  id: string;
  provider: string;
  name: string;
  maskedKey: string;
  status: "active" | "disabled" | "invalid" | "cooldown";
  lastUsedAt: string | null;
  lastSuccessfulUseAt: string | null;
  lastErrorCategory: string | null;
  cooldownUntil: string | null;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

interface CredentialStats {
  total: number;
  active: number;
  disabled: number;
  invalid: number;
  cooldown: number;
}

interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  recentSuccessRate: number;
}

interface OverviewData {
  credentials: CredentialStats;
  usage: UsageStats;
  recentEvents: Array<{
    id: string;
    provider: string;
    model: string;
    modality: string;
    status: string;
    errorCategory: string | null;
    latencyMs: number | null;
    retryCount: number;
    createdAt: number;
  }>;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      return {
        data: null,
        error: (body as { error?: string }).error ?? `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    active:   { dot: "bg-green-600",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
    disabled: { dot: "bg-gray-500",   text: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200"  },
    invalid:  { dot: "bg-red-600",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"   },
    cooldown: { dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
    success:  { dot: "bg-green-600",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
    failure:  { dot: "bg-red-600",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"   },
  };
  const s = styles[status] ?? styles["disabled"]!;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.text} ${s.bg} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${s.dot}`} />
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "green" | "red" | "amber";
}) {
  const valueColor =
    accent === "green" ? "text-green-700" :
    accent === "red"   ? "text-red-600"   :
    accent === "amber" ? "text-amber-600" :
    "text-[#0f0f0f]";

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-6 py-5 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-[1.75rem] font-bold leading-none ${valueColor}`}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add credential form
// ---------------------------------------------------------------------------

function AddCredentialForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await apiFetch("/api/admin/ai/credentials", {
      method: "POST",
      body: JSON.stringify({ name, apiKey, provider: "gemini" }),
    });

    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setName("");
      setApiKey("");
      setOpen(false);
      onAdded();
    }
  };

  if (!open) {
    return (
      <button
        className="bg-[#0f0f0f] text-white border-0 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-85"
        onClick={() => setOpen(true)}
      >
        Add API Key
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-[480px]">
      <h3 className="text-base font-semibold mt-0 mb-4">Add Gemini API Key</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-[0.8rem] font-medium text-gray-700">
            Credential Name
          </label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none transition-colors font-[inherit] focus:border-[#0f0f0f]"
            type="text"
            placeholder="e.g. Gemini Account 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[0.8rem] font-medium text-gray-700">API Key</label>
          <input
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none transition-colors font-[inherit] focus:border-[#0f0f0f]"
            type="password"
            placeholder="AIza... or AQ.Ab..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            minLength={10}
            autoComplete="off"
          />
          <span className="text-xs text-gray-400">
            The key is encrypted before storage and never shown again.
          </span>
        </div>
        {error && (
          <div className="text-[0.8rem] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-50"
            onClick={() => { setOpen(false); setError(null); }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#0f0f0f] text-white border-0 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Credential row actions
// ---------------------------------------------------------------------------

function CredentialRow({
  credential,
  onRefresh,
  isFirst,
}: {
  credential: SafeCredential;
  onRefresh: () => void;
  isFirst?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(credential.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const doAction = async (path: string, method = "POST") => {
    setLoading(true);
    await apiFetch(`/api/admin/ai/credentials/${credential.id}${path}`, { method });
    setLoading(false);
    onRefresh();
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    const { data, error } = await apiFetch<{ valid: boolean; error?: string }>(
      `/api/admin/ai/credentials/${credential.id}/test`,
      { method: "POST" }
    );
    setLoading(false);
    setTestResult(data ?? { valid: false, error: error ?? "Unknown error" });
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiFetch(`/api/admin/ai/credentials/${credential.id}/name`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    });
    setLoading(false);
    setRenaming(false);
    onRefresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await apiFetch(`/api/admin/ai/credentials/${credential.id}`, { method: "DELETE" });
    setLoading(false);
    setConfirmDelete(false);
    onRefresh();
  };

  const lastUsed = credential.lastUsedAt
    ? new Date(credential.lastUsedAt).toLocaleString()
    : "Never";

  return (
    <tr className={!isFirst ? "border-t border-gray-100" : undefined}>
      {/* Name */}
      <td className="px-4 py-3 align-middle">
        {renaming ? (
          <form onSubmit={handleRename} className="flex gap-2 items-center">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-[0.85rem] outline-none font-[inherit] focus:border-[#0f0f0f]"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#0f0f0f] text-white border-0 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 disabled:opacity-40"
              disabled={loading}
            >
              Save
            </button>
            <button
              type="button"
              className="bg-white text-gray-700 border border-gray-300 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-gray-50"
              onClick={() => { setRenaming(false); setNewName(credential.name); }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <span
            className="cursor-pointer font-medium hover:underline"
            title="Click to rename"
            onClick={() => setRenaming(true)}
          >
            {credential.name}
          </span>
        )}
      </td>

      {/* Masked key */}
      <td className="px-4 py-3 align-middle font-mono text-[0.8rem] text-gray-500">
        {credential.maskedKey}
      </td>

      {/* Provider */}
      <td className="px-4 py-3 align-middle">
        <span className="text-[0.8rem] text-gray-500 capitalize">{credential.provider}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={credential.status} />
      </td>

      {/* Last used */}
      <td className="px-4 py-3 align-middle text-[0.8rem] text-gray-500">{lastUsed}</td>

      {/* Health */}
      <td className="px-4 py-3 align-middle">
        {credential.lastErrorCategory ? (
          <span className="text-xs text-red-600">
            {credential.lastErrorCategory}
            {credential.consecutiveFailures > 0 && ` (x${credential.consecutiveFailures})`}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-middle">
        <div className="flex gap-1.5 flex-wrap items-center">
          {credential.status === "disabled" ? (
            <button
              className="bg-[#0f0f0f] text-white border-0 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 disabled:opacity-40"
              onClick={() => doAction("/enable")}
              disabled={loading}
            >
              Enable
            </button>
          ) : (
            <button
              className="bg-white text-gray-700 border border-gray-300 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-gray-50"
              onClick={() => doAction("/disable")}
              disabled={loading}
            >
              Disable
            </button>
          )}

          <button
            className="bg-[#0f0f0f] text-white border-0 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleTest}
            disabled={loading || credential.status === "disabled"}
            title="Makes a real API call to validate the key"
          >
            Test
          </button>

          {!confirmDelete ? (
            <button
              className="bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-red-100 disabled:opacity-40"
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              Delete
            </button>
          ) : (
            <>
              <span className="text-xs text-red-600">Confirm?</span>
              <button
                className="bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-red-100 disabled:opacity-40"
                onClick={handleDelete}
                disabled={loading}
              >
                Yes, delete
              </button>
              <button
                className="bg-white text-gray-700 border border-gray-300 rounded px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-gray-50"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          )}

          {testResult && (
            <span
              className={`text-xs rounded px-1.5 py-0.5 border ${
                testResult.valid
                  ? "text-green-700 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }`}
            >
              {testResult.valid ? "Valid" : (testResult.error ?? "Invalid")}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Shared table header / cell classes
// ---------------------------------------------------------------------------

const thCls =
  "text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap";

// ---------------------------------------------------------------------------
// Main dashboard page
// ---------------------------------------------------------------------------

export default function AiGatewayDashboard() {
  const [credentials, setCredentials] = useState<SafeCredential[]>([]);
  const [stats, setStats] = useState<CredentialStats | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [listRes, overviewRes] = await Promise.all([
      apiFetch<{ credentials: SafeCredential[]; stats: CredentialStats }>(
        "/api/admin/ai/credentials"
      ),
      apiFetch<OverviewData>("/api/admin/ai/credentials/stats/overview"),
    ]);

    if (listRes.error) {
      setError(listRes.error);
    } else if (listRes.data) {
      setCredentials(listRes.data.credentials);
      setStats(listRes.data.stats);
      setError(null);
    }

    if (overviewRes.data) {
      setOverview(overviewRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <>
      {/* Page header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold m-0">AI Gateway</h1>
          <p className="text-gray-500 text-sm mt-1 mb-0">
            Manage Gemini API credentials and monitor gateway health.
          </p>
        </div>
        <AddCredentialForm onAdded={fetchData} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-600 text-sm mb-6">
          {error === "Authentication required"
            ? "You must be signed in as a super-admin to access this page."
            : error === "Forbidden"
            ? "You do not have permission to access this page."
            : error}
        </div>
      )}

      {/* Overview stats */}
      {(stats || overview) && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">
            Overview
          </h2>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
            <StatCard label="Total Keys"      value={stats?.total ?? 0} />
            <StatCard label="Active"          value={stats?.active ?? 0}    accent="green" />
            <StatCard label="Disabled"        value={stats?.disabled ?? 0} />
            <StatCard label="Invalid"         value={stats?.invalid ?? 0}   accent={stats?.invalid ? "red" : undefined} />
            <StatCard label="Cooldown"        value={stats?.cooldown ?? 0}  accent={stats?.cooldown ? "amber" : undefined} />
            {overview && (
              <>
                <StatCard label="Total Requests" value={overview.usage.totalRequests} />
                <StatCard
                  label="Success Rate"
                  value={`${overview.usage.recentSuccessRate}%`}
                  accent={overview.usage.recentSuccessRate >= 90 ? "green" : "amber"}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Credential list */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">
          Credentials
        </h2>

        {loading ? (
          <div className="py-12 text-center text-gray-400 bg-white rounded-lg border border-gray-200">
            Loading...
          </div>
        ) : credentials.length === 0 && !error ? (
          <div className="py-12 text-center text-gray-400 bg-white rounded-lg border border-gray-200 text-sm">
            No credentials added yet. Click &ldquo;Add API Key&rdquo; to get started.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className={thCls}>Name</th>
                    <th className={thCls}>Key</th>
                    <th className={thCls}>Provider</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}>Last Used</th>
                    <th className={thCls}>Health</th>
                    <th className={thCls}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred, i) => (
                    <CredentialRow
                      key={cred.id}
                      credential={cred}
                      onRefresh={fetchData}
                      isFirst={i === 0}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Recent activity */}
      {overview && overview.recentEvents.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">
            Recent Activity
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[0.8rem]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className={thCls}>Model</th>
                    <th className={thCls}>Modality</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}>Latency</th>
                    <th className={thCls}>Retries</th>
                    <th className={thCls}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentEvents.map((event, i) => (
                    <tr key={event.id} className={i > 0 ? "border-t border-gray-100" : undefined}>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono text-xs">{event.model}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-gray-600">{event.modality}</td>
                      <td className="px-4 py-3 align-middle">
                        <StatusBadge status={event.status} />
                        {event.errorCategory && (
                          <span className="ml-1.5 text-[0.7rem] text-red-600">
                            ({event.errorCategory})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-gray-600">
                        {event.latencyMs !== null ? `${event.latencyMs}ms` : "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-gray-600">{event.retryCount}</td>
                      <td className="px-4 py-3 align-middle text-gray-500">
                        {new Date(event.createdAt * 1000).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
