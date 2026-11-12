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
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <nav className="flex items-center gap-8 px-8 h-14 bg-[#0f0f0f] text-white border-b border-[#222]">
        <div className="text-[0.95rem] font-semibold tracking-tight text-white">
          Examinr Admin
        </div>
        <ul className="list-none flex gap-6 m-0 p-0">
          <li>
            <a
              href="/admin/ai"
              className="text-sm text-[#aaa] no-underline transition-colors duration-150 hover:text-white"
            >
              AI Gateway
            </a>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
