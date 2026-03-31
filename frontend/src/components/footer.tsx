export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} Portfolio</p>
        <p className="text-xs tracking-wide">Django + Next.js Fullstack</p>
      </div>
    </footer>
  );
}
