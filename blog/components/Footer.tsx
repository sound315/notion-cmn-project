export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-gray-500">
        <p>© {currentYear} Dev Blog. All rights reserved.</p>
        <p className="mt-1">Powered by Notion & Next.js</p>
      </div>
    </footer>
  );
}
