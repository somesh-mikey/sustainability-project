import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const routeTitles = {
	"/dashboard": "Home",
	"/dashboards": "Dashboards",
	"/data-submission": "Data Submission",
	"/api-integrations": "API Integrations",
	"/data-requests": "Data Requests",
	"/reports": "Reports",
	"/talk-with-team": "Talk With Your Team",
	"/templates": "Templates",
	"/profile": "Profile & Settings",
	"/projects": "Projects",
	"/emissions": "Emissions"
};

export default function Header() {
	const { pathname } = useLocation();
	const { user, logout } = useAuth();

	const title = routeTitles[pathname] || "Sustainability Platform";

	return (
		<header className="border-b border-slate-200 bg-white px-6 md:px-8 py-4 flex items-center justify-between">
			<div>
				<h1 className="text-xl font-semibold text-slate-800">{title}</h1>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-sm text-slate-600">{user?.name || "User"}</span>
				<button
					onClick={logout}
					className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
