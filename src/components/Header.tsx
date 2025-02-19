
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 transition-all duration-200">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold">Prototype</span>
      </div>
      <ThemeToggle />
    </header>
  );
};
