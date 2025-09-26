import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

type Athlete = {
  id: string;
  username: string | null;
  full_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  coach_id: string | null;
};

async function getAthlete(id: string): Promise<Athlete | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  const r = await fetch(`${base}/data/athletes/${id}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`API ${r.status}`);
  return await r.json();
}

export default async function AthleteDetail({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gov_session")?.value;
  if (!token) redirect("/login");
  try { await verifyToken(token); } catch { redirect("/login"); }

  const athlete = await getAthlete(params.id);
  if (!athlete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/dashboard" className="text-sm text-[#0b5b39] underline">← Back</a>
          <h1 className="mt-4 text-xl font-semibold">Athlete not found</h1>
        </div>
      </div>
    );
  }

  const bmi = athlete.height_cm && athlete.weight_kg
    ? Math.round((athlete.weight_kg / ((athlete.height_cm / 100) ** 2)) * 10) / 10
    : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-[#f6fff7]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/dashboard" className="text-lg text-[#0b5b39]">← Back</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="rounded-xl border bg-white">
          <div className="px-4 py-3 border-b bg-[#fffbf5]">
            <h1 className="text-lg font-semibold text-[#9a4a00]">
              {athlete.full_name || "Unnamed Athlete"}
            </h1>
            <p className="text-sm text-gray-600">ID: {athlete.id}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-black/60">
            <Field label="Username" value={athlete.username || "-"} />
            <Field label="Coach ID" value={athlete.coach_id || "-"} />
            <Field label="Age" value={athlete.age ?? "-"} />
            <Field label="Height (cm)" value={athlete.height_cm ?? "-"} />
            <Field label="Weight (kg)" value={athlete.weight_kg ?? "-"} />
            <Field label="BMI" value={bmi ?? "-"} />
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  );
}
