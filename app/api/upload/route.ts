import { NextResponse } from "next/server";
import {
  assertCloudinaryConfig,
  default as cloudinary,
} from "@/lib/cloudinary";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!(await getSessionUser()))
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    assertCloudinaryConfig();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 400 },
      );
    if (!file.type.startsWith("image/"))
      return NextResponse.json(
        { message: "Only image files are allowed." },
        { status: 400 },
      );
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json(
        { message: "Image must be 5MB or smaller." },
        { status: 400 },
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "lumina/products", resource_type: "image" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(buffer);
    });
    return NextResponse.json(
      { url: result.secure_url, publicId: result.public_id },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Image upload failed." },
      { status: 500 },
    );
  }
}
