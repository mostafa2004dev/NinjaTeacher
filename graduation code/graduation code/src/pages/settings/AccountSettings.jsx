import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, Bell, Shield, Mail, Phone, Globe, Save,
  Camera, LogOut, ChevronRight, AlertCircle,
  Settings as SettingsIcon, CheckCircle2, Loader2, Eye, EyeOff, ChevronDown, Trash2
} from "lucide-react";
import { resolveImage } from "../../component/utilitis/Resolveimage";

/* ─────────────────────────────────────────
   Toggle component
───────────────────────────────────────── */
function Toggle({ enabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${enabled ? "bg-[#6366f1]" : "bg-gray-300"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${enabled ? "left-7" : "left-1"}`} />
    </button>
  );
}

/* ─────────────────────────────────────────
   PasswordField
───────────────────────────────────────── */
const inputStyle = {
  background: "var(--surface-input)",
  borderColor: "var(--border-default)",
  color: "var(--text-primary)",
};

function PasswordField({ label, fieldKey, showKey, value, show, onChange, onToggleShow }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black ml-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2" size={20} style={{ color: "var(--text-muted)" }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full h-16 pl-14 pr-14 rounded-[22px] outline-none border-2 transition-all font-medium"
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => onToggleShow(showKey)}
          className="absolute right-5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Security Tab
───────────────────────────────────────── */
function SecurityTab({ BASE_URL, authHeaders }) {
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cardStyle = {
    background: "var(--surface-card)",
    border: "1px solid var(--border-default)",
  };

  const validate = () => {
    if (!fields.currentPassword || !fields.newPassword || !fields.confirmPassword)
      return "All fields are required.";
    if (fields.newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (fields.newPassword === fields.currentPassword)
      return "New password must be different from current password.";
    if (fields.newPassword !== fields.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleFieldChange = (fieldKey, val) => setFields((f) => ({ ...f, [fieldKey]: val }));
  const handleToggleShow = (showKey) => setShow((s) => ({ ...s, [showKey]: !s[showKey] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const validationError = validate();
    if (validationError) return setError(validationError);

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setSuccess("Password changed successfully!");
      setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = (() => {
    const p = fields.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["#ef4444", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  return (
    <div className="rounded-[40px] p-8 md:p-12 shadow-xl" style={cardStyle}>
      <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
        <Lock className="text-[#9333ea]" size={28} />
        <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Security Settings
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <PasswordField label="Current Password" fieldKey="currentPassword" showKey="current" value={fields.currentPassword} show={show.current} onChange={handleFieldChange} onToggleShow={handleToggleShow} />
        <PasswordField label="New Password" fieldKey="newPassword" showKey="newPass" value={fields.newPassword} show={show.newPass} onChange={handleFieldChange} onToggleShow={handleToggleShow} />
        <PasswordField label="Confirm New Password" fieldKey="confirmPassword" showKey="confirm" value={fields.confirmPassword} show={show.confirm} onChange={handleFieldChange} onToggleShow={handleToggleShow} />

        {fields.newPassword && (
          <div className="space-y-2 px-1">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: strength >= i ? strengthColor[strength] : "var(--border-default)" }} />
              ))}
            </div>
            <p className="text-xs font-bold" style={{ color: strengthColor[strength] }}>
              {strengthLabel[strength]}
            </p>
          </div>
        )}

        {fields.confirmPassword && (
          <div className="flex items-center gap-2 text-sm font-medium px-1"
            style={{ color: fields.newPassword === fields.confirmPassword ? "#10b981" : "#ef4444" }}>
            {fields.newPassword === fields.confirmPassword
              ? <><CheckCircle2 size={16} /> Passwords match</>
              : <><AlertCircle size={16} /> Passwords do not match</>}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
            <AlertCircle size={18} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)", color: "#10b981" }}>
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">{success}</span>
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="w-full h-16 mt-2 bg-gradient-to-r from-[#9333ea] to-[#2563eb] text-white font-black text-lg rounded-[22px] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="animate-spin" size={22} /> : <Lock size={22} />}
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function AccountSettings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Account");
  const [profileImg, setProfileImg] = useState(null);
  const fileInputRef = useRef(null);

  const [privacy, setPrivacy] = useState({ showEmail: true, showPhone: false });
  const [notifs, setNotifs] = useState({ email: true, push: false, messages: true, updates: true });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const BASE_URL = "http://localhost:3000";
  const authHeaders = () => {
    const t = localStorage.getItem("userToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const [account, setAccount] = useState({ name: "", email: "", phone: "", bio: "" });
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  // ── جلب بيانات المستخدم ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/users/me`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const u = d?.data || d || {};
        setAccount({ name: u.Name || "", email: u.Email || "", phone: u.Phone || "", bio: u.Bio || "" });
        if (u.Role) setUserRole(u.Role);
        // ✅ resolveImage يتعامل مع backslashes و relative paths
        if (u.Image) setProfileImg(resolveImage(u.Image));
      })
      .catch(() => { });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(`${BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ Name: account.name, Phone: account.phone, Bio: account.bio }),
      });

      if (fileInputRef.current?.files?.[0]) {
        const fd = new FormData();
        fd.append("profileImage", fileInputRef.current.files[0]);
        await fetch(`${BASE_URL}/users/profile-photo`, {
          method: "PUT",
          headers: { ...authHeaders() },
          body: fd,
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  // // ✅ Back to Dashboard حسب الـ role
  // const handleBackToDashboard = () => {
  //   if (userRole === "teacher") navigate("/TeacherPortal");
  //   else if (userRole === "school") navigate("/SchoolDashboard");
  //   else navigate("/");
  // };

  const cardStyle = { background: "var(--surface-card)", border: "1px solid var(--border-default)" };
  const rowStyle = { background: "var(--surface-muted)", border: "1px solid var(--border-default)" };

  const tabs = [
    { id: "Account", icon: User, label: "Account" },
    { id: "Security", icon: Lock, label: "Security" },
    { id: "Notifications", icon: Bell, label: "Notifications" },
    { id: "Privacy", icon: Shield, label: "Privacy" },
  ];

  return (
    <div className="min-h-screen w-full pb-20 font-sans relative text-left" style={{ background: "var(--surface-page)" }}>

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-[32px] p-8 max-w-md w-full mx-4 shadow-2xl" style={cardStyle}>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Delete Account?</h3>
            <p className="font-medium mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Are you sure? This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 font-black rounded-2xl transition-all"
                style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={() => { alert("Account Deleted"); setShowDeleteModal(false); }}
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {showSuccess && (
        <div className="fixed top-24 right-10 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Settings updated successfully!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-12">

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-5">
            <div className="text-[#a855f7]"><SettingsIcon size={48} strokeWidth={1.5} /></div>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>Settings</h1>
              <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Manage your account settings and preferences</p>
            </div>
          </div>
          {/* ✅ Back to Dashboard حسب الـ role */}
          {/* <button
            onClick={handleBackToDashboard}
            className="px-8 py-3.5 border-2 border-[#a855f7] text-[#a855f7] font-bold rounded-[18px] text-[15px] transition-all hover:bg-[#a855f7]/10"
            style={{ background: "var(--surface-card)" }}
          >
            Back to Dashboard
          </button> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="rounded-[32px] p-4 shadow-xl" style={cardStyle}>
              {tabs.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl mb-1 transition-all font-bold text-[15px]"
                  style={{
                    background: activeTab === item.id ? "var(--surface-muted)" : "transparent",
                    color: activeTab === item.id ? "#9333ea" : "var(--text-muted)",
                  }}>
                  <div className="flex items-center gap-3">
                    <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    {item.label}
                  </div>
                  {activeTab === item.id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9">

            {/* ── Account Tab ── */}
            {activeTab === "Account" && (
              <div className="rounded-[40px] p-8 md:p-12 shadow-xl" style={cardStyle}>
                <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <User className="text-[#9333ea]" size={28} />
                  <h2 className="text-2xl font-black tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>Account Settings</h2>
                </div>

                {/* Avatar */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-10" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <div className="relative group">
                    <div className="w-24 h-24 bg-[#eeefff] rounded-full flex items-center justify-center text-2xl font-black text-[#6366f1] border-4 overflow-hidden"
                      style={{ borderColor: "var(--border-default)" }}>
                      {profileImg
                        ? <img src={profileImg} className="w-full h-full object-cover" alt="profile"
                          onError={() => setProfileImg(null)} />
                        : (account.name ? account.name.charAt(0).toUpperCase() : "U")}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full shadow-md text-[#9333ea] hover:scale-110 transition-transform"
                      style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)" }}>
                      <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Profile Picture</h3>
                    <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Upload your photo or school logo.</p>
                    <div className="flex gap-4 mt-5 justify-center md:justify-start">
                      <button type="button" onClick={() => fileInputRef.current.click()}
                        className="px-5 py-2.5 bg-[#f5f3ff] text-[#9333ea] text-[13px] font-black rounded-xl hover:bg-purple-100 transition-all">
                        Change photo
                      </button>
                      <button type="button" onClick={handleRemoveImage}
                        className="px-5 py-2.5 text-[#ef4444] text-[13px] font-black rounded-xl hover:bg-red-50 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black ml-1" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                      <input type="email" value={account.email} readOnly
                        className="w-full h-16 pl-6 rounded-[22px] outline-none border-2 transition-all font-medium opacity-60 cursor-not-allowed"
                        style={inputStyle} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black ml-1" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
                      <input type="text" placeholder="+20 1XX XXX XXXX" value={account.phone}
                        onChange={(e) => setAccount((a) => ({ ...a, phone: e.target.value }))}
                        className="w-full h-16 pl-6 rounded-[22px] outline-none border-2 transition-all font-medium"
                        style={inputStyle} />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-sm font-black ml-1" style={{ color: "var(--text-secondary)" }}>Language</label>
                      <div className="relative">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2" size={20} style={{ color: "var(--text-muted)" }} />
                        <select className="w-full h-16 pl-14 pr-10 rounded-[22px] outline-none appearance-none font-medium border-2 cursor-pointer transition-all" style={inputStyle}>
                          <option>English (US)</option>
                          <option>Arabic (EG)</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full h-16 mt-6 bg-gradient-to-r from-[#6366f1] to-[#9333ea] text-white font-black text-lg rounded-[22px] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-60">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={24} />} Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === "Security" && (
              <SecurityTab BASE_URL={BASE_URL} authHeaders={authHeaders} />
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "Notifications" && (
              <div className="rounded-[40px] p-8 md:p-12 shadow-xl" style={cardStyle}>
                <div className="flex items-center gap-4 mb-10">
                  <Bell className="text-[#9333ea]" size={28} />
                  <h2 className="text-2xl font-black tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>Notification Preferences</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { id: "email", title: "Email Notifications", desc: "Receive notifications via email" },
                    { id: "push", title: "Push Notifications", desc: "Receive push alerts on device" },
                    { id: "updates", title: "Application Updates", desc: "Notifications about your job matching" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl transition-all group" style={rowStyle}>
                      <div>
                        <h4 className="text-[15px] font-black tracking-tight group-hover:text-[#6366f1] transition-colors" style={{ color: "var(--text-primary)" }}>
                          {item.title}
                        </h4>
                        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                      </div>
                      <Toggle enabled={notifs[item.id]} onClick={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id] })} />
                    </div>
                  ))}
                </div>
                <button onClick={handleSave}
                  className="w-full h-16 mt-10 bg-[#9333ea] text-white font-black text-lg rounded-[22px] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all">
                  Save Preferences
                </button>
              </div>
            )}

            {/* ── Privacy Tab ── */}
            {activeTab === "Privacy" && (
              <div className="rounded-[40px] p-8 md:p-12 shadow-xl" style={cardStyle}>
                <div className="flex items-center gap-4 mb-10 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <Shield className="text-[#9333ea]" size={28} />
                  <h2 className="text-2xl font-black tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>Privacy Settings</h2>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black ml-1" style={{ color: "var(--text-secondary)" }}>Profile Visibility</label>
                    <div className="relative">
                      <Shield className="absolute left-5 top-1/2 -translate-y-1/2" size={20} style={{ color: "var(--text-muted)" }} />
                      <select className="w-full h-16 pl-14 rounded-[22px] outline-none font-medium border-2 appearance-none cursor-pointer transition-all" style={inputStyle}>
                        <option>Public Profile</option>
                        <option>Private Profile</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" size={20} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: "showEmail", icon: Mail, title: "Show Email Address", desc: "Display email on public profile" },
                      { key: "showPhone", icon: Phone, title: "Show Phone Number", desc: "Display phone on public profile" },
                    ].map((item) => (
                      <div key={item.key} className="p-6 rounded-3xl flex items-center justify-between transition-all group" style={rowStyle}>
                        <div className="flex items-center gap-5">
                          <div className="p-3 rounded-xl shadow-sm group-hover:text-[#6366f1] transition-colors"
                            style={{ background: "var(--surface-card)", color: "var(--text-muted)" }}>
                            <item.icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-black tracking-tight" style={{ color: "var(--text-primary)" }}>{item.title}</h4>
                            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                          </div>
                        </div>
                        <Toggle enabled={privacy[item.key]} onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })} />
                      </div>
                    ))}
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-8" style={{ borderTop: "1px solid var(--border-default)" }}>
                    <div className="flex items-center gap-3 mb-6 text-[#ef4444] font-black">
                      <AlertCircle size={22} /> Danger Zone
                    </div>
                    <div className="p-8 rounded-[32px]" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <h4 className="font-black mb-2 leading-none" style={{ color: "var(--text-primary)" }}>Delete Account</h4>
                      <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Once you delete your account, there is no going back. All your data will be permanently deleted.
                      </p>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-8 py-4 bg-[#ef4444] text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}