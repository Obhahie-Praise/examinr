import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Examinr",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <div className="admin-nav-brand">Examinr Admin</div>
        <ul className="admin-nav-links">
          <li>
            <a href="/admin/ai">AI Gateway</a>
          </li>
        </ul>
      </nav>
      <main className="admin-content">{children}</main>
      <style>{`
        .admin-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
          background: #f8f8f8;
        }
        .admin-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 0 2rem;
          height: 56px;
          background: #0f0f0f;
          color: #fff;
          border-bottom: 1px solid #222;
        }
        .admin-nav-brand {
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .admin-nav-links {
          list-style: none;
          display: flex;
          gap: 1.5rem;
        }
        .admin-nav-links a {
          font-size: 0.875rem;
          color: #aaa;
          text-decoration: none;
          transition: color 0.15s;
        }
        .admin-nav-links a:hover {
          color: #fff;
        }
        .admin-content {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
