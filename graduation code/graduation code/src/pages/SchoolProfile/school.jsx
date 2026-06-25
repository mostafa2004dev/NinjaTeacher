import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2, MapPin, Star, Users, GraduationCap,
  BookOpen, Heart, CheckCircle2, Award, Mail,
  Phone, Globe, Edit, CheckCircle, X, Loader2,
} from "lucide-react";
import { SCHOOL_TYPES, GOVERNORATES, GOV_CITIES } from "../../data/schoolOptions";

const BASE_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("userToken");
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** الصورة ممكن تيجي relative path زي "/uploads/..." أو URL كامل */
function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${BASE_URL}${img}`;
}

// ── Reusable field components ────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
      {children}
    </label>
  );
}

function FieldInput({ ...props }) {
  return (
    <input
      className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
      style={{
        background: "var(--surface-muted)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
      }}
      {...props}
    />
  );
}

function FieldSelect({ children, ...props }) {
  return (
    <select
      className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
      style={{
        background: "var(--surface-muted)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-semibold text-purple-600 uppercase tracking-wider pb-2"
      style={{ borderBottom: "1px solid var(--border-default)" }}
    >
      {children}
    </p>
  );
}

// ── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    Name: "",
    Phone: "",
    Bio: "",
    Governorate: "",
    Location: "",
    Website_URL: "",
    School_Name: "",
    School_Type: "",
    School_Size: "",
    // الأقسام اللي كانت static
    Core_Values: "",
    Academic_Programs: "",
    Achievements: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        Name: initialData.name ?? "",
        Phone: initialData.phone ?? "",
        Bio: initialData.bio ?? "",
        Governorate: initialData.governorate ?? "",
        Location: initialData.location ?? "",
        Website_URL: initialData.website_url ?? "",
        School_Name: initialData.school_name ?? "",
        School_Type: initialData.school_type ?? "",
        School_Size: initialData.school_size ?? "",
        Core_Values: initialData.core_values ?? "",
        Academic_Programs: initialData.academic_programs ?? "",
        Achievements: initialData.achievements ?? "",
      });
      setError("");
    }
  }, [isOpen, initialData]);

  const handle = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGov = (e) => {
    setFormData((prev) => ({ ...prev, Governorate: e.target.value, Location: "" }));
  };

  const cityOptions = formData.Governorate ? (GOV_CITIES[formData.Governorate] ?? []) : [];

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await axios.put(
        `${BASE_URL}/school/profile`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      onSave(res.data.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Building2 className="w-5 h-5" />
            <h2 className="text-base font-semibold">Edit school profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {error && (
            <div className="text-sm text-red-500 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <SectionLabel>Basic info</SectionLabel>

          <div>
            <FieldLabel>School name</FieldLabel>
            <FieldInput name="School_Name" value={formData.School_Name} onChange={handle} />
          </div>

          <div>
            <FieldLabel>Display name</FieldLabel>
            <FieldInput name="Name" value={formData.Name} onChange={handle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>School type</FieldLabel>
              <FieldSelect name="School_Type" value={formData.School_Type} onChange={handle}>
                <option value="">Select type</option>
                {SCHOOL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>School size (students)</FieldLabel>
              <FieldInput
                type="number"
                name="School_Size"
                value={formData.School_Size}
                onChange={handle}
                min="0"
              />
            </div>
          </div>

          <div>
            <FieldLabel>About</FieldLabel>
            <textarea
              name="Bio"
              value={formData.Bio}
              onChange={handle}
              rows={4}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Contact & Location */}
          <SectionLabel>Contact & location</SectionLabel>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Governorate</FieldLabel>
              <FieldSelect name="Governorate" value={formData.Governorate} onChange={handleGov}>
                <option value="">Select governorate</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>City</FieldLabel>
              <FieldSelect
                name="Location"
                value={formData.Location}
                onChange={handle}
                disabled={!formData.Governorate}
              >
                <option value="">
                  {formData.Governorate ? "Select city" : "Select governorate first"}
                </option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </FieldSelect>
            </div>
          </div>

          <div>
            <FieldLabel>Phone</FieldLabel>
            <FieldInput type="tel" name="Phone" value={formData.Phone} onChange={handle} />
          </div>

          <div>
            <FieldLabel>Website</FieldLabel>
            <FieldInput type="url" name="Website_URL" value={formData.Website_URL} onChange={handle} placeholder="https://..." />
          </div>

          {/* School Content */}
          <SectionLabel>School content</SectionLabel>

          <div>
            <FieldLabel>Core Values (سطر لكل قيمة)</FieldLabel>
            <textarea
              name="Core_Values"
              value={formData.Core_Values}
              onChange={handle}
              rows={4}
              placeholder={"Academic Excellence\nCharacter Development\nCommunity Engagement"}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>اكتب كل قيمة في سطر منفصل</p>
          </div>

          <div>
            <FieldLabel>Academic Programs (سطر لكل برنامج | اسم: وصف)</FieldLabel>
            <textarea
              name="Academic_Programs"
              value={formData.Academic_Programs}
              onChange={handle}
              rows={5}
              placeholder={"STEM Program: Specialized science and technology curriculum\nArts & Music: Award-winning arts program"}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>اكتب كل برنامج في سطر: اسم البرنامج: وصفه</p>
          </div>

          <div>
            <FieldLabel>Achievements (سطر لكل إنجاز)</FieldLabel>
            <textarea
              name="Achievements"
              value={formData.Achievements}
              onChange={handle}
              rows={4}
              placeholder={"National Blue Ribbon School\n100% College Acceptance Rate"}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>اكتب كل إنجاز في سطر منفصل</p>
          </div>

        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3 shrink-0"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              background: "transparent",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : <><CheckCircle className="w-4 h-4" /> Save changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── helpers لتحويل النص المقسم بـ newlines لـ arrays ────────────────────────

function parseLines(str) {
  if (!str) return [];
  return str.split("\n").map((s) => s.trim()).filter(Boolean);
}

function parsePrograms(str) {
  if (!str) return [];
  return str.split("\n").map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return { title: line.trim(), desc: "" };
    return { title: line.slice(0, idx).trim(), desc: line.slice(idx + 1).trim() };
  }).filter((p) => p.title);
}

// ── Main Page ────────────────────────────────────────────────────────────────

function SchoolProfile() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BASE_URL}/school/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProfile(res.data.data);
    } catch (err) {
      setFetchError(err?.response?.data?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  // ── Destructure with fallbacks ──
  const name        = profile?.school_name ?? profile?.name ?? "—";
  const schoolType  = profile?.school_type ?? "—";
  const schoolSize  = profile?.school_size ?? "—";
  const governorate = profile?.governorate ?? "";
  const location    = profile?.location ?? "";
  const displayLoc  = [location, governorate].filter(Boolean).join(", ") || "—";
  const bio         = profile?.bio || "No description added yet.";
  const email       = profile?.email ?? "—";
  const phone       = profile?.phone || "—";
  const website     = profile?.website_url || "—";
  const rating      = profile?.average_rating ?? 0;
  const reviews     = profile?.total_reviews ?? 0;

  // ── الصورة: نحل مشكلة الـ relative path هنا ──
  const imageUrl    = resolveImage(profile?.image);

  // ── الأقسام الديناميكية ──
  const coreValues     = parseLines(profile?.core_values);
  const programs       = parsePrograms(profile?.academic_programs);
  const achievements   = parseLines(profile?.achievements);

  // ── Fallbacks لو اليوزر لسه ما دخلش بيانات ──
  const displayCoreValues = coreValues.length > 0 ? coreValues : [
    "Academic Excellence", "Character Development", "Community Engagement",
    "Innovation & Creativity", "Diversity & Inclusion", "Lifelong Learning",
  ];
  const displayPrograms = programs.length > 0 ? programs : [
    { title: "Advanced Placement (AP)", desc: "20+ AP courses across all subjects" },
    { title: "STEM Program",            desc: "Specialized science and technology curriculum" },
    { title: "Arts & Music",            desc: "Award-winning arts and music programs" },
    { title: "Athletics",               desc: "15 varsity sports teams" },
  ];
  const displayAchievements = achievements.length > 0 ? achievements : [
    "National Blue Ribbon School",
    "100% College Acceptance Rate",
    "State Championship Athletics",
    "Distinguished STEM Program",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-page)" }}>
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-page)" }}>
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">{fetchError}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-12" style={{ background: "var(--surface-page)", color: "var(--text-primary)" }}>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => setProfile(updated)}
        initialData={profile}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* صورة المدرسة - متصلحة */}
            <div className="bg-white p-4 rounded-2xl shadow-sm shrink-0">
              {imageUrl
                ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "block";
                    }}
                  />
                )
                : null
              }
              {/* fallback icon لو الصورة فشلت أو مش موجودة */}
              <Building2
                className="w-12 h-12 text-purple-600"
                style={{ display: imageUrl ? "none" : "block" }}
              />
            </div>

            <div className="text-white space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{name}</h1>
                <div className="bg-white/20 p-1 rounded-full">
                  <CheckCircle className="w-5 h-5 text-white fill-white/20" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-purple-100 mt-2">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{displayLoc}</span></div>
                <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /><span>{schoolType}</span></div>
              </div>
              {reviews > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 fill-current ${s <= Math.round(rating) ? "text-yellow-400" : "text-yellow-400/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{Number(rating).toFixed(1)} ({reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 text-sm font-medium rounded-lg hover:opacity-90 transition-colors shrink-0"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {[
            { icon: Users,        iconBg: "bg-purple-100", iconColor: "text-purple-600", value: schoolSize || "—", label: "Students" },
            { icon: GraduationCap,iconBg: "bg-blue-100",   iconColor: "text-blue-600",   value: "—",              label: "Teachers" },
            { icon: BookOpen,     iconBg: "bg-pink-100",   iconColor: "text-pink-600",   value: "—",              label: "Class Number" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col items-center justify-center"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <div className={`${s.iconBg} p-3 rounded-xl mb-3`}>
                <s.icon className={`w-6 h-6 ${s.iconColor}`} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</h3>
              <p style={{ color: "var(--text-muted)" }} className="text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <section className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>About Our School</h2>
              </div>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{bio}</p>
            </section>

            {/* Core Values - ديناميكي */}
            <section className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Core Values</h2>
                </div>
                {coreValues.length === 0 && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Add yours
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayCoreValues.map((value, idx) => (
                  <div key={idx} className="rounded-xl p-4 flex items-center gap-3 transition-colors"
                    style={{ background: "var(--surface-muted)", border: "1px solid var(--border-default)" }}>
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    <span className="font-medium text-sm" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Academic Programs - ديناميكي */}
            <section className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Academic Programs</h2>
                </div>
                {programs.length === 0 && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Add yours
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayPrograms.map((prog, idx) => (
                  <div key={idx} className="rounded-xl p-5 transition-colors"
                    style={{ border: "1px solid var(--border-default)" }}>
                    <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{prog.title}</h3>
                    {prog.desc && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{prog.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements - ديناميكي */}
            <section className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Achievements & Recognition</h2>
                </div>
                {achievements.length === 0 && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Add yours
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {displayAchievements.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{a}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">

            {/* Contact */}
            <div className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Contact Information</h2>
              <div className="space-y-6">
                {[
                  { icon: Mail,   label: "Email",    value: email,      isLink: false },
                  { icon: Phone,  label: "Phone",    value: phone,      isLink: false },
                  { icon: Globe,  label: "Website",  value: website,    isLink: true  },
                  { icon: MapPin, label: "Location", value: displayLoc, isLink: false },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <c.icon className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{c.label}</p>
                      {c.isLink && c.value !== "—"
                        ? <a href={c.value} target="_blank" rel="noreferrer" className="text-sm font-medium text-purple-500 hover:underline">{c.value}</a>
                        : <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Info */}
            <div className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>School Info</h2>
              <div className="space-y-4">
                {[
                  { icon: Building2, label: "Type",        value: schoolType },
                  { icon: Users,     label: "Size",        value: schoolSize ? `${schoolSize} students` : "—" },
                  { icon: MapPin,    label: "Governorate", value: governorate || "—" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default SchoolProfile;