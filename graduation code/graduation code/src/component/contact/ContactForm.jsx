// ContactForm.jsx — أُعيدت كتابته بعد تلف RAR — تستخدم useContact الموجود
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useContact } from "../../pages/contact/hooks/useContact";

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function ContactForm() {
  const { mutate, isPending } = useContact();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e) {
    e.preventDefault();
    mutate(form, { onSuccess: () => setForm({ name: "", email: "", subject: "", message: "" }) });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-6 sm:p-8 shadow-sm"
      style={{ background: "var(--surface-card, #fff)", border: "1px solid var(--border-default, #e5e7eb)" }}
    >
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary, #111)" }}>
        Send us a message
      </h2>
      <p className="mt-1 text-sm text-gray-500">We usually reply within one business day.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-600">Name</label>
          <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="Your full name" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-600">Email</label>
          <input required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="you@example.com" />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-600">Subject</label>
        <input required value={form.subject} onChange={set("subject")} className={inputCls} placeholder="How can we help?" />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-600">Message</label>
        <textarea required rows={5} value={form.message} onChange={set("message")} className={inputCls} placeholder="Write your message..." />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
