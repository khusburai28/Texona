import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="bg-background h-full">
      <div className="flex flex-col h-full">
        <Navbar />
        <main className="bg-card flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
