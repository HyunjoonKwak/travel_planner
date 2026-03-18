import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { LegacyCleanup } from "@/components/layout/legacy-cleanup";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-60">
        <Header />
        <main className="pb-20 md:pb-8 px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
      <OnboardingDialog />
      <LegacyCleanup />
    </div>
  );
}
