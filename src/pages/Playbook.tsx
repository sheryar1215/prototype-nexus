
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { PlaybookForm } from "@/components/playbook/PlaybookForm";
import { PlaybookHeader } from "@/components/playbook/PlaybookHeader";

const Playbook = () => {
  const { session } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="transition-all duration-200 ml-[var(--sidebar-width,16rem)] mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <PlaybookHeader 
            title="Create Playbook" 
            description="Fill in the details below to generate a new sales playbook" 
          />
          <PlaybookForm userId={session?.user.id} />
        </div>
      </main>
    </div>
  );
};

export default Playbook;
