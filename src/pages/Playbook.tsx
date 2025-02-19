
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

const Playbook = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 mt-16 p-6">
        <div className="glass rounded-lg p-6">
          <h1 className="text-3xl font-semibold">Playbook</h1>
          <p className="mt-4 text-muted-foreground">
            Access your playbook content and resources here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Playbook;
