/**
 * Examinr root page — minimal placeholder.
 *
 * This page will be replaced with the student landing experience once the
 * core learning platform is built. It exists solely to confirm the application
 * renders correctly with Tailwind CSS and DM Sans applied.
 *
 * Do not build onboarding, student dashboards, or login flows here.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <main className="flex flex-col items-center gap-4 text-center px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0f0f0f]">
          Examinr
        </h1>
        <p className="text-sm text-[#6b7280] max-w-sm leading-relaxed">
          AI-powered examination preparation and personalised learning.
          <br />
          Coming soon.
        </p>
      </main>
    </div>
  );
}
