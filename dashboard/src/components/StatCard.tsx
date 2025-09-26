export default function StatCard({ label, value, accent, bg }:{label:string; value:string; accent:string; bg:string;}) {
    return (
      <div className="rounded-xl border p-4" style={{ backgroundColor: bg }}>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="mt-1 text-2xl font-semibold" style={{ color: accent }}>{value}</div>
      </div>
    );
  }
  