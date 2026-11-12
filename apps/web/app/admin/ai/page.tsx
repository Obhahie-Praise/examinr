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
  const colors: Record<string, string> = {
    active: "#16a34a",
    disabled: "#6b7280",
    invalid: "#dc2626",
    cooldown: "#d97706",
    success: "#16a34a",
    failure: "#dc2626",
  };
  const color = colors[status] ?? "#6b7280";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color,
        background: color + "15",
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        border: `1px solid ${color}30`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
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
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
      }}
    >
      <span
        style={{ fontSize: "0.75rem", color: "#6b7280", letterSpacing: "0.04em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          color: accent ?? "#0f0f0f",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
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
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Add API Key
      </button>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1.5rem",
        maxWidth: 480,
      }}
    >
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
        Add Gemini API Key
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
            Credential Name
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Gemini Account 01"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
            API Key
          </label>
          <input
            className="form-input"
            type="password"
            placeholder="AIza... or AQ.Ab..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            minLength={10}
            autoComplete="off"
          />
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            The key is encrypted before storage and never shown again.
          </span>
        </div>
        {error && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#dc2626",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "0.5rem 0.75rem",
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setOpen(false); setError(null); }}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
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
    <tr style={{ borderTop: !isFirst ? "1px solid #f3f4f6" : undefined }}>
      <td>
        {renaming ? (
          <form
            onSubmit={handleRename}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <input
              className="form-input"
              style={{ padding: "0.3rem 0.5rem", fontSize: "0.85rem" }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
            <button type="submit" className="btn-sm" disabled={loading}>
              Save
            </button>
            <button
              type="button"
              className="btn-sm-secondary"
              onClick={() => { setRenaming(false); setNewName(credential.name); }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <span
            style={{ cursor: "pointer", fontWeight: 500 }}
            title="Click to rename"
            onClick={() => setRenaming(true)}
          >
            {credential.name}
          </span>
        )}
      </td>
      <td style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "0.8rem", color: "#6b7280" }}>
        {credential.maskedKey}
      </td>
      <td>
        <span style={{ fontSize: "0.8rem", color: "#6b7280", textTransform: "capitalize" }}>
          {credential.provider}
        </span>
      </td>
      <td>
        <StatusBadge status={credential.status} />
      </td>
      <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>{lastUsed}</td>
      <td>
        {credential.lastErrorCategory ? (
          <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>
            {credential.lastErrorCategory}
            {credential.consecutiveFailures > 0 && ` (x${credential.consecutiveFailures})`}
          </span>
        ) : (
          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>—</span>
        )}
      </td>
      <td>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
          {credential.status === "disabled" ? (
            <button
              className="btn-sm"
              onClick={() => doAction("/enable")}
              disabled={loading}
            >
              Enable
            </button>
          ) : (
            <button
              className="btn-sm-secondary"
              onClick={() => doAction("/disable")}
              disabled={loading}
            >
              Disable
            </button>
          )}
          <button
            className="btn-sm"
            onClick={handleTest}
            disabled={loading || credential.status === "disabled"}
            title="Makes a real API call to validate the key"
          >
            Test
          </button>
          {!confirmDelete ? (
            <button
              className="btn-sm-danger"
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              Delete
            </button>
          ) : (
            <>
              <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>Confirm?</span>
              <button className="btn-sm-danger" onClick={handleDelete} disabled={loading}>
                Yes, delete
              </button>
              <button
                className="btn-sm-secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          )}
          {testResult && (
            <span
              style={{
                fontSize: "0.75rem",
                color: testResult.valid ? "#16a34a" : "#dc2626",
                background: testResult.valid ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${testResult.valid ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 4,
                padding: "0.15rem 0.4rem",
              }}
            >
              {testResult.valid ? "Valid" : testResult.error ?? "Invalid"}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            AI Gateway
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Manage Gemini API credentials and monitor gateway health.
          </p>
        </div>
        <AddCredentialForm onAdded={fetchData} />
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "1rem 1.25rem",
            color: "#dc2626",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          {error === "Authentication required"
            ? "You must be signed in as a super-admin to access this page."
            : error === "Forbidden"
            ? "You do not have permission to access this page."
            : error}
        </div>
      )}

      {/* Overview stats */}
      {(stats || overview) && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Overview
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <StatCard label="Total Keys" value={stats?.total ?? 0} />
            <StatCard label="Active" value={stats?.active ?? 0} accent="#16a34a" />
            <StatCard label="Disabled" value={stats?.disabled ?? 0} />
            <StatCard label="Invalid" value={stats?.invalid ?? 0} accent={stats?.invalid ? "#dc2626" : undefined} />
            <StatCard label="Cooldown" value={stats?.cooldown ?? 0} accent={stats?.cooldown ? "#d97706" : undefined} />
            {overview && (
              <>
                <StatCard label="Total Requests" value={overview.usage.totalRequests} />
                <StatCard
                  label="Success Rate"
                  value={`${overview.usage.recentSuccessRate}%`}
                  accent={overview.usage.recentSuccessRate >= 90 ? "#16a34a" : "#d97706"}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Credential list */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Credentials
        </h2>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            Loading...
          </div>
        ) : credentials.length === 0 && !error ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#9ca3af",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: "0.875rem",
            }}
          >
            No credentials added yet. Click &ldquo;Add API Key&rdquo; to get started.
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Key</th>
                    <th style={thStyle}>Provider</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Used</th>
                    <th style={thStyle}>Health</th>
                    <th style={thStyle}>Actions</th>
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

      {/* Recent events */}
      {overview && overview.recentEvents.length > 0 && (
        <section>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Recent Activity
          </h2>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={thStyle}>Model</th>
                    <th style={thStyle}>Modality</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Latency</th>
                    <th style={thStyle}>Retries</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentEvents.map((event, i) => (
                    <tr key={event.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "0.75rem" }}>
                          {event.model}
                        </span>
                      </td>
                      <td style={tdStyle}>{event.modality}</td>
                      <td style={tdStyle}>
                        <StatusBadge status={event.status} />
                        {event.errorCategory && (
                          <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: "#dc2626" }}>
                            ({event.errorCategory})
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {event.latencyMs !== null ? `${event.latencyMs}ms` : "—"}
                      </td>
                      <td style={tdStyle}>{event.retryCount}</td>
                      <td style={tdStyle}>
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

      <style>{`
        .btn-primary {
          background: #0f0f0f;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          background: #fff;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #f9fafb; }

        .btn-sm {
          background: #0f0f0f;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-sm:hover { opacity: 0.8; }
        .btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-sm-secondary {
          background: #fff;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-sm-secondary:hover { background: #f9fafb; }

        .btn-sm-danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 4px;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-sm-danger:hover { background: #fee2e2; }
        .btn-sm-danger:disabled { opacity: 0.4; cursor: not-allowed; }

        .form-input {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          width: 100%;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .form-input:focus { border-color: #0f0f0f; }
      `}</style>
    </>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.6rem 1rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#6b7280",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  verticalAlign: "middle",
};
