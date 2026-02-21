import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 md:p-8 overflow-auto bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
