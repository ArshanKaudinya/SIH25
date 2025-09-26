"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button onClick={logout} className="rounded-md px-3 py-2 border bg-[#fff7ed] hover:bg-[#ffe5cc] border-[#ffd7b3] text-[#9a4a00] text-sm">
      Logout
    </button>
  );
}
