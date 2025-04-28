"use server";

import { cookies } from "next/headers";
import { rag_user } from "./const";

export const getUserFromCookie = () => {
  const cookieStore = cookies();
  const user = cookieStore.get(rag_user)?.value;
  return user ? JSON.parse(user) : null;
};
