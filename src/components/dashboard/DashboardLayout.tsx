import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <>
      <MobileNav />
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 overflow-auto md:pt-0 pt-16">
          {children}
        </main>
      </div>
    </>
  );
};
