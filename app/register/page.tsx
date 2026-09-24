"use client";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";
// import { storage } from "@/lib/storage";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/api/auth/register", form);
      //   storage.setSession(undefined, data.user);
      router.replace("/products");
    } catch (err: any) {
      setError(err.userMessage || "Unable to create your account.");
    } finally {
      setBusy(false);
    }
  };
  const input = (
    key: keyof typeof form,
    placeholder: string,
    Icon: any,
    type = "text",
  ) => (
    <div className="relative">
      <Icon className="absolute left-3.5 top-3.5 text-white/30" size={17} />
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/60 focus:ring-4 focus:ring-violet-300/10"
      />
    </div>
  );
  return (
    <main className="noise relative min-h-screen overflow-hidden bg-[#101117] text-white">
      <div className="absolute -left-28 top-1/3 h-80 w-80 rounded-full bg-violet/25 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-aqua/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-white/[.07] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[15px] bg-white text-ink">
              <Sparkles size={19} />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Lumina</div>
              <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">
                Create workspace access
              </div>
            </div>
          </div>
          <div className="mb-7">
            <div className="eyebrow text-white/35">New account</div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-white/45">
              Your account and product changes will persist in MongoDB Atlas.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  First name
                </span>
                {input("firstName", "Monish", UserRound)}
              </label>
              <label>
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  Last name
                </span>
                {input("lastName", "Kumar", UserRound)}
              </label>
            </div>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/65">
                Email
              </span>
              {input("email", "you@example.com", Mail, "email")}
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/65">
                Username
              </span>
              {input("username", "your_username", UserRound)}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  Password
                </span>
                {input(
                  "password",
                  "At least 8 characters",
                  LockKeyhole,
                  show ? "text" : "password",
                )}
              </label>
              <label>
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  Confirm password
                </span>
                {input(
                  "confirmPassword",
                  "Repeat password",
                  LockKeyhole,
                  show ? "text" : "password",
                )}
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-xs font-semibold text-white/40 hover:text-white"
            >
              {show ? "Hide passwords" : "Show passwords"}
            </button>
            {error && (
              <div className="rounded-xl border border-red-300/15 bg-red-400/10 px-3 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
            >
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white hover:text-violet-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
