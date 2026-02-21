import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoadingState from "../components/LoadingState";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProfileSettings() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", industry: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setProfile(data.data);
          setForm({
            name: data.data.organization?.name || "",
            industry: data.data.organization?.industry || ""
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }

    async function loadUsers() {
      const response = await fetch(`${API_URL}/profile/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.data);
      }
    }

    loadUsers();
  }, [token, user?.role]);

  const saveProfile = async () => {
    setStatus("");

    const response = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setStatus("Profile updated");
      return;
    }

    setStatus(data?.error?.message || "Update failed");
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Profile & Settings</h2>
        <p className="text-zinc-400">Manage organization details and user access.</p>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-medium">Company Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Company name"
          />
          <input
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
            value={form.industry}
            onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
            placeholder="Industry"
          />
        </div>

        {user?.role === "admin" ? (
          <button onClick={saveProfile} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Save Changes
          </button>
        ) : null}

        {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      </section>

      {user?.role === "admin" ? (
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-lg font-medium">User Access</h3>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry.id} className="border-t border-zinc-800">
                  <td className="p-3">{entry.name}</td>
                  <td className="p-3">{entry.email}</td>
                  <td className="p-3 capitalize">{entry.role}</td>
                  <td className="p-3">{entry.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {profile?.user ? (
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300">
          Logged in as {profile.user.name} ({profile.user.role})
        </section>
      ) : null}
    </div>
  );
}
