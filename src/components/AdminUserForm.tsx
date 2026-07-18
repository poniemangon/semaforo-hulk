"use client";

import { useState } from "react";

interface CreatedUser {
  id: string;
  email: string;
  username: string;
}

interface AdminUserFormProps {
  initialUsers?: CreatedUser[];
}

export default function AdminUserForm({ initialUsers = [] }: AdminUserFormProps) {
  const [users, setUsers] = useState<CreatedUser[]>(initialUsers);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el usuario.");
      return;
    }

    setUsers((prev) => [data as CreatedUser, ...prev]);
    setEmail("");
    setUsername("");
    setPassword("");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted">CREAR USUARIO</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
        />

        {error && <p className="col-span-full text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="col-span-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:brightness-105 disabled:opacity-60 sm:col-span-1"
        >
          {saving ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {users.length > 0 && (
        <ul className="mt-4 divide-y divide-border border-t border-border pt-2">
          {users.map((u) => (
            <li key={u.id} className="py-2 text-sm text-foreground">
              <span className="font-medium">{u.username}</span>{" "}
              <span className="text-muted">— {u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
