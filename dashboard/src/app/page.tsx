import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import AthleteTable from "@/components/AthleteTable";
import LogoutButton from "@/components/LogoutButton";
import StatCard from "@/components/StatCard";

type Athlete = {
  id: string;
  username: string | null;
  full_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  coach_id: string | null;
};

async function getAthletes(): Promise<Athlete[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const r = await fetch(`${base}/data/athletes`, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return await r.json();
}

export default async function GovDashboard() {
  // cookies() is async in your Next version
  const cookieStore = await cookies();
  const token = cookieStore.get("gov_session")?.value;
  if (!token) redirect("/login");
  try {
    await verifyToken(token);
  } catch {
    redirect("/login");
  }

  let data: Athlete[] = [];
  try {
    data = await getAthletes();
  } catch {
    data = [];
  }

  const count = data.length;
  const avgAge = data.length
    ? Math.round(
        (data.reduce((s, a) => s + (a.age || 0), 0) / data.length) * 10
      ) / 10
    : 0;

  const avgBMI = (() => {
    const vals = data
      .map(a => {
        if (!a.height_cm || !a.weight_kg) return null;
        const m = a.height_cm / 100;
        return a.weight_kg / (m * m);
      })
      .filter((x): x is number => typeof x === "number");
    if (!vals.length) return 0;
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    return Math.round(mean * 10) / 10;
  })();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-[#f6fff7]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-[#0b5b39]">
            Athlete Data Dashboard
          </h1>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Athletes"
            value={count.toString()}
            accent="#0b5b39"
            bg="#e9f7ef"
          />
          <StatCard
            label="Average Age"
            value={isFinite(avgAge) ? avgAge.toString() : "0"}
            accent="#9a4a00"
            bg="#fff7ed"
          />
          <StatCard
            label="Average BMI"
            value={isFinite(avgBMI) ? avgBMI.toString() : "0"}
            accent="#004080"
            bg="#eef4ff"
          />
        </section>

        <section className="rounded-xl border bg-white">
          <div className="px-4 py-3 border-b bg-[#fffbf5]">
            <h2 className="font-medium text-[#9a4a00]">Athletes</h2>
          </div>
          <div className="p-4">
            <AthleteTable rows={data} />
            {!data.length && (
              <p className="text-sm text-gray-500 mt-2">
                No data or API unavailable.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500">
          Government internal use. White background with soft saffron and green
          accents.
        </div>
      </footer>
    </div>
  );
}
