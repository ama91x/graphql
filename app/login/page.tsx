"use client";

import { useRouter } from "next/navigation";
import React, { useState , useEffect } from "react";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("rb01_jwt");

  useEffect(() => {
    if (token) {
      router.push("/");
      return;
    }

  },[token])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = btoa(`${user}:${password}`);
      const res = await fetch("https://learn.reboot01.com/api/auth/signin", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        let message = `Login failed: ${res.status}`;
        try {
          const data = await res.json();
          if (data?.error) message += ` – ${data.error}`;
        } catch {
          const text = await res.text();
          if (text) message += ` – ${text}`;
        }
        setError(message);
        return;
      }

      const token = await res.text();
      if (!token) {
        setError("Login succeeded but token not found.");
        return;
      }

      localStorage.setItem("rb01_jwt", token);
      router.push("/");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="relative w-[400px] p-8 rounded-3xl bg-white/90 backdrop-blur-lg shadow-2xl border border-white/20 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username or Email"
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-black"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-black"
          />
          <button
            disabled={loading}
            className="mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
