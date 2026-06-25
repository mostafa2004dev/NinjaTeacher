import { useRef, useState, useContext } from "react";
import { SCHOOL_TYPES, GOVERNORATES, GOV_CITIES } from "../../../data/schoolOptions";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Radio, RadioGroup } from "@heroui/react";
import { Alert } from "@heroui/react";
import { Link, useNavigate } from "react-router";
import {
    GraduationCap, School, User, Mail, Lock,
    ArrowLeft, UploadCloud, FileText, X,
    Eye, EyeOff
} from "lucide-react";
import axios from "axios";
import { Authcontext } from "../../../context/Authcontext";

const BASE_URL = "http://localhost:3000";

// ─── Schemas ─────────────────────────────────────────────────────────────────
const TEACHER_STAGES = ["Kindergarten", "Primary School", "Middle School", "High School"];

const teacherSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
    gender: z.enum(["male", "female"], { message: "Please select your gender" }),
    teacher_stage: z.enum(["Kindergarten", "Primary School", "Middle School", "High School"], { message: "Please select your teaching stage" }),
    cv: z.instanceof(File, { message: "CV file is required" }),
}).refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

const schoolSchema = z.object({
    name: z.string().min(2, "School name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
    governorate: z.string().min(1, "Governorate is required"),
    city: z.string().min(1, "City is required"),
    school_type: z.string().min(1, "School type is required"),
}).refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

// ─── Shared ───────────────────────────────────────────────────────────────────
function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-red-500 text-xs mt-1 px-1">{message}</p>;
}

function StyledInput({ label, icon: Icon, endContent, ...props }) {
    return (
        <Input
            label={label}
            variant="bordered"
            startContent={Icon && <Icon size={14} className="text-purple-400 flex-shrink-0" />}
            endContent={endContent}
            classNames={{
                inputWrapper: "border border-purple-300 rounded-xl hover:border-purple-400 focus-within:!border-purple-500 shadow-sm",
                label: "text-sm",
                input: "text-[var(--text-primary)]",
                base: "bg-[var(--surface-input)]",
            }}
            {...props}
        />
    );
}

// ─── Password Input ───────────────────────────────────────────────────────────
function PasswordInput({ label, ...props }) {
    const [show, setShow] = useState(false);

    return (
        <StyledInput
            label={label}
            icon={Lock}
            type={show ? "text" : "password"}
            endContent={
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="outline-none text-purple-400 hover:text-purple-600 transition-colors flex items-center"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            }
            {...props}
        />
    );
}

// ─── CV Uploader ──────────────────────────────────────────────────────────────
function CVUploader({ value, onChange, error }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    function handleFile(file) {
        if (!file) return;
        if (file.type !== "application/pdf") return alert("Only PDF files are allowed");
        onChange(file);
    }

    return (
        <div>
            <p className="text-sm mb-1.5" style={{ color: "var(--text-muted)" }}>
                Upload CV <span className="text-xs text-red-400">*</span>
            </p>
            {value ? (
                <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.3)" }}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-purple-500" />
                        <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
                            {value.name}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="hover:text-red-500 transition-colors outline-none"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-7 cursor-pointer transition-all"
                    style={{
                        borderColor: error ? "#ef4444" : dragging ? "#9333ea" : "rgba(147,51,234,0.35)",
                        background: dragging ? "rgba(147,51,234,0.08)" : "rgba(147,51,234,0.04)",
                    }}
                >
                    <UploadCloud size={28} className="text-purple-400" />
                    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Drag and drop your CV here</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>or click to browse (PDF only)</p>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        className="mt-1 px-4 py-1.5 rounded-xl border border-purple-300 text-purple-500 text-xs font-semibold hover:bg-purple-100 transition-all outline-none"
                    >
                        Browse Files
                    </button>
                </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1 px-1">{error}</p>}
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
}

// ─── Logo Header ──────────────────────────────────────────────────────────────
function LogoHeader() {
    return (
        <div className="text-center mb-6">
            <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <GraduationCap size={24} className="text-white" />
            </div>
            <p className="text-xs font-bold text-purple-500 tracking-widest uppercase mb-1">Ninja Teacher</p>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>Create Your Account</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Join our Teacher-School Matching Platform</p>
        </div>
    );
}

function SubmitButton({ isSubmitting }) {
    return (
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all outline-none disabled:opacity-60 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
            {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
    );
}

const cardStyle = {
    background: "var(--surface-card)",
    border: "1px solid var(--border-default)",
};

// ─── Role Selector ────────────────────────────────────────────────────────────
function RoleSelector({ onSelect }) {
    const [hovered, setHovered] = useState(null);

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--surface-page)" }}>
            <div className="w-full max-w-md">
                <LogoHeader />
                <div className="rounded-3xl shadow-xl p-6" style={cardStyle}>
                    <p className="text-center text-sm font-medium mb-6" style={{ color: "var(--text-muted)" }}>I am a...</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { role: "teacher", Icon: User, label: "Teacher", sub: "Looking for teaching opportunities" },
                            { role: "school", Icon: School, label: "School", sub: "Looking to hire qualified teachers" },
                        ].map(({ role, Icon, label, sub }) => (
                            <button
                                key={role}
                                onClick={() => onSelect(role)}
                                onMouseEnter={() => setHovered(role)}
                                onMouseLeave={() => setHovered(null)}
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 text-center outline-none"
                                style={{
                                    borderColor: hovered === role ? "#9333ea" : "var(--border-default)",
                                    background: hovered === role ? "rgba(147,51,234,0.06)" : "var(--surface-muted)",
                                    boxShadow: hovered === role ? "0 4px 16px rgba(147,51,234,0.12)" : "none",
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                                    style={{ background: hovered === role ? "#9333ea" : "rgba(147,51,234,0.1)" }}
                                >
                                    <Icon size={22} className={hovered === role ? "text-white" : "text-purple-500"} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="text-purple-500 font-semibold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

// ─── Form Wrapper ─────────────────────────────────────────────────────────────
function FormWrapper({ title, onBack, children }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--surface-page)" }}>
            <div className="w-full max-w-md">
                <LogoHeader />
                <div className="rounded-3xl shadow-xl p-6" style={cardStyle}>
                    <div className="flex items-center justify-between mb-5">
                        <span
                            className="text-sm font-bold px-3 py-1.5 rounded-xl"
                            style={{ background: "var(--surface-muted)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
                        >
                            {title}
                        </span>
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-xs text-purple-500 font-semibold hover:text-purple-400 flex items-center gap-1 outline-none"
                        >
                            <ArrowLeft size={12} /> Change Role
                        </button>
                    </div>
                    {children}
                </div>
                <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="text-purple-500 font-semibold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

// ─── Teacher Form ─────────────────────────────────────────────────────────────
function TeacherForm({ onBack }) {
    const navigate = useNavigate();
    const { SaveUserToken } = useContext(Authcontext);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState("");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(teacherSchema),
        defaultValues: { name: "", email: "", password: "", confirm_password: "", gender: "", teacher_stage: "", cv: null },
        mode: "onTouched",
    });

    const cvFile = watch("cv");

    async function onSubmit(data) {
        setErrorMessage("");

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("confirm_password", data.confirm_password);
        formData.append("role", "teacher");
        formData.append("gender", data.gender);
        formData.append("teacher_stage", data.teacher_stage);
        formData.append("cv", data.cv);

        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.data?.token) {
                // FIX: use SaveUserToken so token is saved under "userToken"
                // (the key read by every API service), not the wrong "token" key.
                SaveUserToken(res.data.data.token);
                setIsSuccess("Registered successfully! Redirecting...");
                setTimeout(() => navigate("/TeacherSurvey"), 2000);
            }
        } catch (err) {
            setErrorMessage(err?.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <FormWrapper title="Teacher Registration" onBack={onBack}>
            {errorMessage && (
                <Alert color="danger" description={errorMessage} title={errorMessage} variant="bordered" className="mb-4" />
            )}
            {isSuccess && (
                <Alert color="success" description={isSuccess} title={isSuccess} variant="bordered" className="mb-4" />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <StyledInput label="Full Name" icon={User} placeholder="Enter your full name" {...register("name")} />
                    <FieldError message={errors.name?.message} />
                </div>
                <div>
                    <StyledInput label="Email Address" icon={Mail} type="email" placeholder="your.email@example.com" {...register("email")} />
                    <FieldError message={errors.email?.message} />
                </div>
                <div>
                    <PasswordInput label="Password" placeholder="At least 6 characters" {...register("password")} />
                    <FieldError message={errors.password?.message} />
                </div>
                <div>
                    <PasswordInput label="Confirm Password" placeholder="Re-enter your password" {...register("confirm_password")} />
                    <FieldError message={errors.confirm_password?.message} />
                </div>

                <CVUploader
                    value={cvFile}
                    onChange={(file) => setValue("cv", file, { shouldValidate: true })}
                    error={errors.cv?.message}
                />

                <div>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <RadioGroup label="Gender" orientation="horizontal" {...field} classNames={{ label: "text-sm" }}>
                                <Radio value="male">Male</Radio>
                                <Radio value="female">Female</Radio>
                            </RadioGroup>
                        )}
                    />
                    <FieldError message={errors.gender?.message} />
                </div>

                <div>
                    <p className="text-sm mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                        Teaching Stage <span className="text-red-400 text-xs">*</span>
                    </p>
                    <Controller
                        control={control}
                        name="teacher_stage"
                        render={({ field }) => (
                            <select
                                {...field}
                                className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors"
                                style={{
                                    background: "var(--surface-input)",
                                    border: errors.teacher_stage ? "1px solid #ef4444" : "1px solid rgba(147,51,234,0.3)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                <option value="">Select your teaching stage</option>
                                {TEACHER_STAGES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        )}
                    />
                    <FieldError message={errors.teacher_stage?.message} />
                </div>

                <p className="text-xs text-center pt-1" style={{ color: "var(--text-muted)" }}>
                    I accept the{" "}
                    <span className="text-purple-500 font-medium cursor-pointer hover:underline">Terms and Conditions</span>
                    {" "}and{" "}
                    <span className="text-purple-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>
                </p>
                <SubmitButton isSubmitting={isSubmitting} />
            </form>
        </FormWrapper>
    );
}

// ─── School Form ──────────────────────────────────────────────────────────────
function SchoolForm({ onBack }) {
    const navigate = useNavigate();
    const { SaveUserToken } = useContext(Authcontext);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState("");

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schoolSchema),
        defaultValues: { name: "", email: "", password: "", confirm_password: "", governorate: "", city: "", school_type: "" },
        mode: "onTouched",
    });

    const selectedGov = watch("governorate");
    const cityOptions = selectedGov ? (GOV_CITIES[selectedGov] || []) : [];

    async function onSubmit(data) {
        setErrorMessage("");

        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, {
                name: data.name,
                email: data.email,
                password: data.password,
                confirm_password: data.confirm_password,
                role: "school",
                governorate: data.governorate,
                city: data.city,
                location: data.city,
                school_type: data.school_type,
                type: data.school_type,
            });

            if (res.data.data?.token) {
                // FIX: use SaveUserToken so token is saved under "userToken"
                // (the key read by every API service), not the wrong "token" key.
                SaveUserToken(res.data.data.token);
                setIsSuccess("Registered successfully! Redirecting...");
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (err) {
            setErrorMessage(err?.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <FormWrapper title="School Registration" onBack={onBack}>
            {errorMessage && (
                <Alert color="danger" description={errorMessage} title={errorMessage} variant="bordered" className="mb-4" />
            )}
            {isSuccess && (
                <Alert color="success" description={isSuccess} title={isSuccess} variant="bordered" className="mb-4" />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <StyledInput label="School Name" icon={School} placeholder="Enter school name" {...register("name")} />
                    <FieldError message={errors.name?.message} />
                </div>
                <div>
                    <StyledInput label="Email Address" icon={Mail} type="email" placeholder="school@example.com" {...register("email")} />
                    <FieldError message={errors.email?.message} />
                </div>

                {/* ── Governorate → City → Type (values from the schools dataset) ── */}
                <div>
                    <label className="text-sm font-medium mb-1.5 block px-1" style={{ color: "var(--text-secondary)" }}>Governorate</label>
                    <select
                        {...register("governorate")}
                        onChange={(e) => { register("governorate").onChange(e); setValue("city", ""); }}
                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all border"
                        style={{ background: "var(--surface-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                    >
                        <option value="">Select governorate</option>
                        {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <FieldError message={errors.governorate?.message} />
                </div>

                <div>
                    <label className="text-sm font-medium mb-1.5 block px-1" style={{ color: "var(--text-secondary)" }}>City</label>
                    <select
                        {...register("city")}
                        disabled={!selectedGov}
                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all border disabled:opacity-50"
                        style={{ background: "var(--surface-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                    >
                        <option value="">{selectedGov ? "Select city" : "Select governorate first"}</option>
                        {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <FieldError message={errors.city?.message} />
                </div>

                <div>
                    <label className="text-sm font-medium mb-1.5 block px-1" style={{ color: "var(--text-secondary)" }}>School Type</label>
                    <select
                        {...register("school_type")}
                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all border"
                        style={{ background: "var(--surface-muted)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                    >
                        <option value="">Select school type</option>
                        {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <FieldError message={errors.school_type?.message} />
                </div>
                <div>
                    <PasswordInput label="Password" placeholder="At least 6 characters" {...register("password")} />
                    <FieldError message={errors.password?.message} />
                </div>
                <div>
                    <PasswordInput label="Confirm Password" placeholder="Re-enter your password" {...register("confirm_password")} />
                    <FieldError message={errors.confirm_password?.message} />
                </div>

                <p className="text-xs text-center pt-1" style={{ color: "var(--text-muted)" }}>
                    I accept the{" "}
                    <span className="text-purple-500 font-medium cursor-pointer hover:underline">Terms and Conditions</span>
                    {" "}and{" "}
                    <span className="text-purple-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>
                </p>
                <SubmitButton isSubmitting={isSubmitting} />
            </form>
        </FormWrapper>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Registration() {
    const [role, setRole] = useState(null);
    if (role === "teacher") return <TeacherForm onBack={() => setRole(null)} />;
    if (role === "school") return <SchoolForm onBack={() => setRole(null)} />;
    return <RoleSelector onSelect={setRole} />;
}