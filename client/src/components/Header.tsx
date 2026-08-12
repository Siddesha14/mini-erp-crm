import { Menu, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={21} />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm font-medium text-slate-800">
          Operations Dashboard
        </p>
        <p className="text-xs text-slate-400">
          Manage your business operations
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              {user?.name}
            </p>

            <p className="text-xs text-slate-400">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;