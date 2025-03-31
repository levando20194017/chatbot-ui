"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    const newPassword = formData.get("new-password")

    try {
      const formUrlEncoded = new URLSearchParams();
      formUrlEncoded.append("username", username as string);
      formUrlEncoded.append("password", password as string);
      formUrlEncoded.append("newPassword", newPassword as string);

      const data = await api.post("/api/auth/change-password", formUrlEncoded, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Change password failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Change password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please input to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label
                  htmlFor="new password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "changing..." : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
