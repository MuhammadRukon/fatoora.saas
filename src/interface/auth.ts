import { User } from "@payload-types";

export interface RegisterData
  extends Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "emailVerified" | "image" | "role"
  > {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}