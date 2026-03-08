import { Outlet } from "react-router-dom";
import ClientSidebar from "./ClientSidebar";

export default function ClientLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <ClientSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
