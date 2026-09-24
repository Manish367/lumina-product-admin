"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/api/auth/me")
      .then(() => {
        if (active) {
          router.replace("/products");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await api.post("/api/auth/login", {
        username,
        password,
      });

      // Always start a new authenticated session from the products page.
      // Do not reuse a previous user's product-detail URL.
      router.replace("/products");
    } catch (err: any) {
      setError(
        err.userMessage ||
          "Invalid username or password. Please check your details.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="noise relative min-h-screen overflow-hidden bg-[#101117] text-white">
      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-aqua/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-2 lg:px-10">
        <section className="hidden lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[15px] bg-white text-ink">
              <Sparkles size={19} />
            </div>

            <span className="font-display text-xl font-bold">Lumina</span>
          </div>

          <div className="max-w-xl">
            <div className="eyebrow text-white/40">
              Product operations, reimagined
            </div>

            <h1 className="mt-4 font-display text-6xl font-bold leading-[.98] tracking-[-.05em]">
              Make every product decision feel{" "}
              <span className="text-violet-300">clear.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-white/55">
              A focused control center for teams who want their catalog, data
              and daily decisions in one calm workspace.
            </p>
          </div>

          <div className="mt-12 flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-display text-2xl font-bold">194+</div>
              <div className="text-xs text-white/40">catalog items</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-display text-2xl font-bold">Cloud</div>
              <div className="text-xs text-white/40">
                persistent workspace
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-white text-ink">
              <Sparkles size={18} />
            </div>

            <span className="font-display text-lg font-bold">Lumina</span>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[.07] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
            <div className="mb-8">
              <div className="eyebrow text-white/35">Welcome back</div>

              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
                Sign in to Lumina
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Use the required demo account or your registered account.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  Username
                </span>

                <div className="relative">
                  <UserRound
                    className="absolute left-3.5 top-3.5 text-white/30"
                    size={17}
                  />

                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/60 focus:ring-4 focus:ring-violet-300/10"
                    placeholder="Username"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/65">
                  Password
                </span>

                <div className="relative">
                  <LockKeyhole
                    className="absolute left-3.5 top-3.5 text-white/30"
                    size={17}
                  />

                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-11 text-sm text-white outline-none transition focus:border-violet-300/60 focus:ring-4 focus:ring-violet-300/10"
                    placeholder="Password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-3 text-white/30 hover:text-white"
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-xl border border-red-300/15 bg-red-400/10 px-3 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
              >
                {busy ? "Signing in…" : "Enter workspace"}

                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-white/45">
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold text-white hover:text-violet-200"
              >
                Create an account
              </Link>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-center text-xs text-white/35">
              Demo:{" "}
              <span className="font-semibold text-white/55">emilys</span>{" "}
              /{" "}
              <span className="font-semibold text-white/55">
                emilyspass
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}