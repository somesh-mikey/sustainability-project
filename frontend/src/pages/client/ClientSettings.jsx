import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Building2, Users, Bell, Plug, Shield, Save, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

const TABS = [
  { id: "company", label: "Company Information", icon: <Building2 size={16} /> },
  { id: "users", label: "User Management", icon: <Users size={16} /> },
  { id: "notifications", label: "Notification Preferences", icon: <Bell size={16} /> },
  { id: "api", label: "API Connections", icon: <Plug size={16} /> },
  { id: "security", label: "Security Settings", icon: <Shield size={16} /> },
];

export default function ClientSettings() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("company");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Company form
  const [companyForm, setCompanyForm] = useState({
    name: "", industry: "", registration_number: "", country: "", address: "",
  });

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    email_data_requests: true, email_messages: true, email_reports: true,
    push_data_requests: true, push_messages: false, push_reports: true,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: "", newPassword: "", confirm: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
        setCompanyForm({
          name: data.data.organization_name || "",
          industry: data.data.industry || "",
          registration_number: data.data.registration_number || "",
          country: data.data.country || "",
          address: data.data.address || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function saveCompany(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: companyForm.name }),
      });
      if (res.ok) setSuccessMsg("Company information saved!");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      alert("Passwords do not match");
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Password changed successfully!");
        setPasswordForm({ current: "", newPassword: "", confirm: "" });
      }
    } catch (err) {
      console.error("Password change error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your organization settings and preferences.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <Save size={16} />
          {successMsg}
        </div>
      )}

      <div className="flex gap-8">
        {/* Tab Navigation */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSuccessMsg(""); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === "company" && (
              <form onSubmit={saveCompany} className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Company Information</h2>
                <p className="text-sm text-gray-500 mb-4">Update your organization's details.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Company Name" value={companyForm.name} onChange={(v) => setCompanyForm(f => ({ ...f, name: v }))} />
                  <InputField label="Industry" value={companyForm.industry} onChange={(v) => setCompanyForm(f => ({ ...f, industry: v }))} />
                  <InputField label="Registration Number" value={companyForm.registration_number} onChange={(v) => setCompanyForm(f => ({ ...f, registration_number: v }))} />
                  <InputField label="Country" value={companyForm.country} onChange={(v) => setCompanyForm(f => ({ ...f, country: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <textarea
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {activeTab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage users in your organization.</p>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Plus size={16} />
                    Add User
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">{user?.name || profile?.name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user?.email || profile?.email || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">{user?.role || "client"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mb-6">Choose how you'd like to be notified.</p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <Toggle label="Data request updates" checked={notifPrefs.email_data_requests} onChange={(v) => setNotifPrefs(p => ({ ...p, email_data_requests: v }))} />
                      <Toggle label="New messages" checked={notifPrefs.email_messages} onChange={(v) => setNotifPrefs(p => ({ ...p, email_messages: v }))} />
                      <Toggle label="Report ready" checked={notifPrefs.email_reports} onChange={(v) => setNotifPrefs(p => ({ ...p, email_reports: v }))} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Push Notifications</h3>
                    <div className="space-y-3">
                      <Toggle label="Data request updates" checked={notifPrefs.push_data_requests} onChange={(v) => setNotifPrefs(p => ({ ...p, push_data_requests: v }))} />
                      <Toggle label="New messages" checked={notifPrefs.push_messages} onChange={(v) => setNotifPrefs(p => ({ ...p, push_messages: v }))} />
                      <Toggle label="Report ready" checked={notifPrefs.push_reports} onChange={(v) => setNotifPrefs(p => ({ ...p, push_reports: v }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">API Connections</h2>
                <p className="text-sm text-gray-500 mb-6">Manage third-party integrations and API keys.</p>
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Plug size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No API connections configured</p>
                  <p className="text-gray-400 text-sm mt-1">Contact Wefetch to set up integrations with your data sources.</p>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <form onSubmit={changePassword} className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Settings</h2>
                <p className="text-sm text-gray-500 mb-4">Update your password and security preferences.</p>
                <InputField label="Current Password" type="password" value={passwordForm.current} onChange={(v) => setPasswordForm(f => ({ ...f, current: v }))} />
                <InputField label="New Password" type="password" value={passwordForm.newPassword} onChange={(v) => setPasswordForm(f => ({ ...f, newPassword: v }))} />
                <InputField label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(v) => setPasswordForm(f => ({ ...f, confirm: v }))} />
                <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
        </div>
      </div>
    </label>
  );
}
