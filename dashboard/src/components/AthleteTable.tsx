/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Athlete = {
  id: string;
  username: string | null;
  full_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  coach_id: string | null;
};

export default function AthleteTable({ rows }: { rows: Athlete[] | unknown }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<keyof Athlete>("full_name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const safeRows: Athlete[] = Array.isArray(rows) ? (rows as Athlete[]) : [];
    const text = q.trim().toLowerCase();
    let r = safeRows;

    if (text) {
      r = safeRows.filter(a =>
        [a.full_name, a.username, a.coach_id]
          .some(v => (v || "").toLowerCase().includes(text))
      );
    }

    return [...r].sort((a, b) => {
      const av = (a[sort] ?? "") as any;
      const bv = (b[sort] ?? "") as any;
      if (typeof av === "number" && typeof bv === "number") {
        return dir === "asc" ? av - bv : bv - av;
      }
      return dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, q, sort, dir]);

  function setSortCol(k: keyof Athlete) {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(k); setDir("asc"); }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search name, username, coach id"
          className="w-full sm:w-80 border rounded-md px-3 py-2 text-black/60"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#e9f7ef] text-[#0b5b39]">
            <tr>
              <Th onClick={() => setSortCol("full_name")} active={sort==="full_name"} dir={dir}>Name</Th>
              <Th onClick={() => setSortCol("username")} active={sort==="username"} dir={dir}>Username</Th>
              <Th onClick={() => setSortCol("age")} active={sort==="age"} dir={dir}>Age</Th>
              <Th onClick={() => setSortCol("height_cm")} active={sort==="height_cm"} dir={dir}>Height cm</Th>
              <Th onClick={() => setSortCol("weight_kg")} active={sort==="weight_kg"} dir={dir}>Weight kg</Th>
              <Th onClick={() => setSortCol("coach_id")} active={sort==="coach_id"} dir={dir}>Coach</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr
                key={a.id}
                onClick={() => router.push(`/dashboard/athletes/${a.id}`)}
                className="hover:bg-[#fffbf5] cursor-pointer text-black/60"
              >
                <td className="px-3 py-2 underline decoration-dotted">{a.full_name || "-"}</td>
                <td className="px-3 py-2">{a.username || "-"}</td>
                <td className="px-3 py-2">{a.age ?? "-"}</td>
                <td className="px-3 py-2">{a.height_cm ?? "-"}</td>
                <td className="px-3 py-2">{a.weight_kg ?? "-"}</td>
                <td className="px-3 py-2">{a.coach_id ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-500">{filtered.length} shown</p>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th
      onClick={onClick}
      className="px-3 py-2 text-left cursor-pointer select-none"
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {active && <span>{dir === "asc" ? "▲" : "▼"}</span>}
      </div>
    </th>
  );
}
