"use client";

import Cookies from "js-cookie";
import { rag_user } from "./const";

export const getUserFromCookieClient = () => {
  const storedUser = Cookies.get(rag_user);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const saveUserToCookieClient = (user: any) => {
  Cookies.set(rag_user, JSON.stringify(user), { expires: 1, path: "/" });
};
