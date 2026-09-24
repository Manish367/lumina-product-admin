"use client";
import { useEffect, useState } from "react";
import { BarChart3, Boxes, LogOut, Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// import { storage } from "@/lib/storage";
import { api } from "@/lib/axios";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  // useEffect(() => {
  //   const token = storage.getToken();
  //   if (!token) {
  //     router.replace("/login");
  //     return;
  //   }
  //   setUser(storage.getUser());
  //   setReady(true);
  // }, [router]);
  useEffect(() => {
    let active = true;

    api
      .get("/api/auth/me")
      .then(({ data }) => {
        if (!active) return;

        setUser(data.user);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          router.replace("/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router]);
  if (!ready) return <div className="min-h-screen bg-cloud" />;
  const nav = [
    { href: "/products", label: "Products", icon: Boxes },
    { href: "/products/new", label: "Add product", icon: Plus },
  ];
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white/85 px-4 py-5 backdrop-blur-xl lg:flex">
        <Link href="/products" className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-ink text-white shadow-glow">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-display text-[18px] font-bold tracking-tight">
              Lumina
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-gray-400">
              Control center
            </div>
          </div>
        </Link>
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-gray-400">
          Workspace
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname.startsWith(item.href) &&
              !(item.href === "/products" && pathname === "/products/new");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-ink text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-ink"}`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-cloud p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet to-aqua text-xs font-bold text-white">
              {user?.firstName?.[0] || "E"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">
                {user?.firstName || "Emily"} {user?.lastName || "Stone"}
              </div>
              <div className="truncate text-xs text-gray-400">
                Administrator
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              void api
                .post("/api/auth/logout")
                .catch(() => {})
                .finally(() => {
                  // storage.clearSession();
                  router.replace("/login");
                });
            }}
            className="mt-4 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-gray-500 hover:bg-white hover:text-ink"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>
      <main className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-line bg-cloud/80 px-5 backdrop-blur-xl lg:px-8">
          <div>
            <div className="eyebrow">Product operations</div>
            <div className="font-display text-lg font-bold">
              {pathname === "/products/new"
                ? "Create product"
                : pathname.startsWith("/products/")
                  ? "Product detail"
                  : "Catalog overview"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/products/new" className="btn-primary">
              <Plus size={16} />{" "}
              <span className="hidden sm:inline">New product</span>
            </Link>
            <button
              onClick={() => {
                void api
                  .post("/api/auth/logout")
                  .catch(() => {})
                  .finally(() => {
                    // storage.clearSession();
                    router.replace("/login");
                  });
              }}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-gray-500 hover:text-ink lg:hidden"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
