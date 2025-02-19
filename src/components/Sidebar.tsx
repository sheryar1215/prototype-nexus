
import { Home, BookOpen, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Playbook", path: "/playbook" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <aside className="glass fixed left-0 top-16 bottom-0 w-64 p-4 transition-all duration-200">
      <nav className="flex h-full flex-col">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-accent ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive transition-all duration-200 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
