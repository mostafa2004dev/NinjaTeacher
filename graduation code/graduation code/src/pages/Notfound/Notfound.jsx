// Notfound.jsx — أُعيدت كتابته بعد تلف RAR
import { Link } from "react-router";

export default function Notfound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-extrabold text-indigo-600">404</p>
      <h1 className="mt-3 text-2xl font-bold" style={{ color: "var(--text-primary, #111)" }}>
        Page not found
      </h1>
      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
      >
        Back to home
      </Link>
    </div>
  );
}
