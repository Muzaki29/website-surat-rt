"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface PengurusRow {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

export function PengurusManager() {
  const [users, setUsers] = useState<PengurusRow[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sekretaris-rt" });

  const load = useCallback(async () => {
    const res = await fetch("/api/pengurus");
    if (res.ok) setUsers(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pengurus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", password: "", role: "sekretaris-rt" });
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/pengurus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Manajemen Pengurus" description="Kelola akun Ketua, Sekretaris, Bendahara, dan Admin." />
      <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border p-5 sm:grid-cols-2">
        <Input label="Nama" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium">Peran</label>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="ketua-rt">Ketua RT</option>
            <option value="sekretaris-rt">Sekretaris RT</option>
            <option value="bendahara-rt">Bendahara RT</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" className="sm:col-span-2">Tambah Pengurus</Button>
      </form>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-[var(--color-text-muted)]">
            <th className="py-2">Nama</th>
            <th>Email</th>
            <th>Peran</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-[var(--color-border)]">
              <td className="py-2 font-medium">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.active ? "Aktif" : "Nonaktif"}</td>
              <td>
                <button type="button" className="text-xs text-[var(--color-primary)]" onClick={() => toggleActive(u.id, u.active)}>
                  {u.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
