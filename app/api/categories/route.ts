import { NextResponse } from "next/server";
import { dummyApi } from "@/lib/axios";
import { connectMongo } from "@/lib/mongodb";
import { ProductModel } from "@/lib/models/Product";

export async function GET() {
  try {
    const [{ data }] = await Promise.all([
      dummyApi.get("/products/categories"),
    ]);
    await connectMongo();
    const local = await ProductModel.find({ deleted: false })
      .select("category")
      .lean();
    const extra = local.map((p: any) => p.category).filter(Boolean);
    const map = new Map<string, { slug: string; name: string }>();
    for (const item of data as any[]) {
      const slug = typeof item === "string" ? item : item.slug;
      const name = typeof item === "string" ? item : item.name;
      if (slug) map.set(slug, { slug, name });
    }
    for (const category of extra)
      if (!map.has(category))
        map.set(category, {
          slug: category,
          name: category.replace(/-/g, " "),
        });
    return NextResponse.json(
      Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)),
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unable to load categories." },
      { status: 500 },
    );
  }
}
