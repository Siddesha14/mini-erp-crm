import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
    },
    {
      label: "Customers",
      path: "/customers",
      icon: Users,
      roles: ["ADMIN", "SALES", "ACCOUNTS"],
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
      roles: ["ADMIN", "WAREHOUSE", "ACCOUNTS"],
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Boxes,
      roles: ["ADMIN", "WAREHOUSE"],
    },
    {
      label: "Challans",
      path: "/challans",
      icon: FileText,
      roles: ["ADMIN", "SALES", "ACCOUNTS"],
    },
  ];

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role ?? "")
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              M
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">
                Mini ERP
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Operations Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2 : 1.8}
                      />

                      <span className="flex-1">{item.label}</span>

                      <ChevronRight
                        size={15}
                        className={`transition-all ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>

                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {user?.role || "USER"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;