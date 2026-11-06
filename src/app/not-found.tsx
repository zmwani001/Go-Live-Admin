import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
      <Link
        href="/overview"
        className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
      >
        Return to overview
      </Link>
    </main>
  );
}
