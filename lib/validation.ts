export function validateRegistration(input: any) {
  const firstName = String(input?.firstName || "").trim();

  const lastName = String(input?.lastName || "").trim();

  const username = String(input?.username || "")
    .trim()
    .toLowerCase();

  const email = String(input?.email || "")
    .trim()
    .toLowerCase();

  const password = String(input?.password || "");

  const errors: Record<string, string> = {};

  if (firstName.length < 2) {
    errors.firstName =
      "First name must be at least 2 characters.";
  }

  if (lastName.length < 2) {
    errors.lastName =
      "Last name must be at least 2 characters.";
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    errors.username =
      "Use 3–30 lowercase letters, numbers or underscores.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    errors.password =
      "Password must be at least 8 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: {
      firstName,
      lastName,
      username,
      email,
      password,
    },
  };
}

export function validateProduct(input: any) {
  const title = String(input?.title || "").trim();

  const description = String(
    input?.description || "",
  ).trim();

  const category = String(
    input?.category || "",
  )
    .trim()
    .toLowerCase();

  const price = Number(input?.price);

  const stock = Number(input?.stock);

  const discountPercentage =
    input?.discountPercentage === undefined ||
    input?.discountPercentage === ""
      ? 0
      : Number(input.discountPercentage);

  const brand = String(input?.brand || "").trim();

  const sku = String(input?.sku || "").trim();

  const weight =
    input?.weight === undefined ||
    input?.weight === ""
      ? undefined
      : Number(input.weight);

  const availabilityStatus = String(
    input?.availabilityStatus || "",
  ).trim();

  const warrantyInformation = String(
    input?.warrantyInformation || "",
  ).trim();

  const shippingInformation = String(
    input?.shippingInformation || "",
  ).trim();

  const returnPolicy = String(
    input?.returnPolicy || "",
  ).trim();

  const minimumOrderQuantity =
    input?.minimumOrderQuantity === undefined ||
    input?.minimumOrderQuantity === ""
      ? undefined
      : Number(input.minimumOrderQuantity);

  const tags = Array.isArray(input?.tags)
    ? input.tags
        .filter(
          (tag: unknown) =>
            typeof tag === "string",
        )
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : [];

  const rawImages = Array.isArray(input?.images)
    ? input.images
        .filter(
          (image: unknown) =>
            typeof image === "string",
        )
        .map((image: string) => image.trim())
        .filter(Boolean)
    : [];

  const thumbnail = String(
    input?.thumbnail ||
      rawImages[0] ||
      "",
  ).trim();

  const width =
    input?.dimensions?.width === undefined ||
    input?.dimensions?.width === ""
      ? undefined
      : Number(input.dimensions.width);

  const height =
    input?.dimensions?.height === undefined ||
    input?.dimensions?.height === ""
      ? undefined
      : Number(input.dimensions.height);

  const depth =
    input?.dimensions?.depth === undefined ||
    input?.dimensions?.depth === ""
      ? undefined
      : Number(input.dimensions.depth);

  const errors: Record<string, string> = {};

  if (!title) {
    errors.title = "Title is required.";
  }

  if (title.length > 140) {
    errors.title =
      "Title must be 140 characters or less.";
  }

  if (!description) {
    errors.description =
      "Description is required.";
  }

  if (description.length > 3000) {
    errors.description =
      "Description must be 3000 characters or less.";
  }

  if (!category) {
    errors.category = "Category is required.";
  }

  if (!Number.isFinite(price) || price < 0) {
    errors.price =
      "Price must be a valid non-negative number.";
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    errors.stock =
      "Stock must be a non-negative whole number.";
  }

  if (
    !Number.isFinite(discountPercentage) ||
    discountPercentage < 0 ||
    discountPercentage > 100
  ) {
    errors.discountPercentage =
      "Discount must be between 0 and 100.";
  }

  if (
    weight !== undefined &&
    (!Number.isFinite(weight) || weight < 0)
  ) {
    errors.weight =
      "Weight must be a valid non-negative number.";
  }

  if (
    width !== undefined &&
    (!Number.isFinite(width) || width < 0)
  ) {
    errors.width =
      "Width must be a valid non-negative number.";
  }

  if (
    height !== undefined &&
    (!Number.isFinite(height) || height < 0)
  ) {
    errors.height =
      "Height must be a valid non-negative number.";
  }

  if (
    depth !== undefined &&
    (!Number.isFinite(depth) || depth < 0)
  ) {
    errors.depth =
      "Depth must be a valid non-negative number.";
  }

  if (
    minimumOrderQuantity !== undefined &&
    (!Number.isInteger(
      minimumOrderQuantity,
    ) ||
      minimumOrderQuantity < 1)
  ) {
    errors.minimumOrderQuantity =
      "Minimum order quantity must be a whole number greater than 0.";
  }

  if (
    thumbnail &&
    !/^https?:\/\//i.test(thumbnail)
  ) {
    errors.thumbnail =
      "Image URL must be a valid HTTP(S) URL.";
  }

  for (const image of rawImages) {
    if (!/^https?:\/\//i.test(image)) {
      errors.images =
        "Every image URL must be a valid HTTP(S) URL.";
      break;
    }
  }

  if (sku.length > 80) {
    errors.sku =
      "SKU must be 80 characters or less.";
  }

  if (brand.length > 80) {
    errors.brand =
      "Brand must be 80 characters or less.";
  }

  if (availabilityStatus.length > 100) {
    errors.availabilityStatus =
      "Availability status is too long.";
  }

  if (warrantyInformation.length > 300) {
    errors.warrantyInformation =
      "Warranty information is too long.";
  }

  if (shippingInformation.length > 300) {
    errors.shippingInformation =
      "Shipping information is too long.";
  }

  if (returnPolicy.length > 300) {
    errors.returnPolicy =
      "Return policy is too long.";
  }

  const images =
    rawImages.length > 0
      ? rawImages
      : thumbnail
        ? [thumbnail]
        : [];

  return {
    valid: Object.keys(errors).length === 0,

    errors,

    value: {
      title,
      description,
      category,
      price,
      stock,
      discountPercentage,
      brand: brand || undefined,
      sku: sku || undefined,
      tags,
      weight,
      dimensions: {
        width,
        height,
        depth,
      },
      availabilityStatus,
      warrantyInformation,
      shippingInformation,
      returnPolicy,
      minimumOrderQuantity,
      thumbnail,
      images,
    },
  };
}