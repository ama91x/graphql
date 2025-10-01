"use client";

import DailyXP from "@/components/DailyXP";
import Ratio from "@/components/Ratio";
import SkillSpiderGraph from "@/components/SkillSpiderGraph";
import UserInfo from "@/components/UserInfo";
import { graphqlFetch } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  campus?: string;
  attrs?: {
    country?: string;
    phoneNumber?: string;
    qualification?: string;
    dateOfBirth?: string;
  };
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("rb01_jwt");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);

        const userData = await graphqlFetch(`{
          user {
            id
            login
            firstName
            lastName
            campus
            attrs
          }
        }`);

        const currentUser = userData.user[0];
        setUser(currentUser);
      } catch (err: unknown) {
        const e = err as Error;
        console.error(err);
        setError(e.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading)
    return (
      <div className="p-8 text-center text-white text-xl">Loading profile…</div>
    );
  if (error)
    return <div className="p-8 text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 font-sans">
      {/* Header */}
      <header className="w-full max-h-[80px] flex items-center justify-between px-6 py-4  shadow-lg">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Student Dashboard
        </h1>
        <button
          className="px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500  transition-all text-white font-semibold rounded-xl shadow-md cursor-pointer"
          onClick={() => {
            localStorage.removeItem("rb01_jwt");
            router.push("/login");
          }}
        >
          Logout
        </button>
      </header>

      {/* Dashboard Grid */}
      <main className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 px-6">
        {/* Ratio Card */}
        <div className="bg-white rounded-2xl  p-3 flex flex-col items-center justify-center transition-transform hover:scale-101">
          <Ratio userId={user?.id} />
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl  p-3 flex flex-col gap-4 transition-transform hover:scale-101">
          <UserInfo
            firstName={user?.firstName}
            lastName={user?.lastName}
            userName={user?.login}
            country={user?.attrs?.country}
            dateOfBirth={user?.attrs?.dateOfBirth}
            qualification={user?.attrs?.qualification}
          />
        </div>

        {/* Daily XP Card */}
        <div className="bg-white rounded-2xl  p-3 flex items-center justify-center transition-transform hover:scale-101">
          <DailyXP />
        </div>

        {/* Skill Spider Graph Card */}
        <div className="bg-white rounded-2xl  p-3 flex items-center justify-center transition-transform hover:scale-101">
          <SkillSpiderGraph />
        </div>
      </main>
    </div>
  );
}
