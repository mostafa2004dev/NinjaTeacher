// ContactInfoCards.jsx — أُعيدت كتابته بعد تلف RAR
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const cards = [
  { icon: Mail,   title: "Email",        lines: ["support@ninjateacher.com"] },
  { icon: Phone,  title: "Phone",        lines: ["+20 100 000 0000"] },
  { icon: MapPin, title: "Office",       lines: ["Cairo, Egypt"] },
  { icon: Clock,  title: "Working hours", lines: ["Sun – Thu, 9:00 – 17:00"] },
];

export default function ContactInfoCards() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {cards.map(({ icon: Icon, title, lines }) => (
        <div
          key={title}
          className="rounded-2xl p-5 shadow-sm"
          style={{ background: "var(--surface-card, #fff)", border: "1px solid var(--border-default, #e5e7eb)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Icon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary, #111)" }}>{title}</p>
              {lines.map((l) => (
                <p key={l} className="text-sm text-gray-500">{l}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
