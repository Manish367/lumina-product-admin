import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema>;
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
