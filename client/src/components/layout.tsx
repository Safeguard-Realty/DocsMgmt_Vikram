import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { FileText, LayoutDashboard, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-sidebar border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold">RealEstate DMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.fullName}</p>
        </div>
        <nav className="space-y-1 px-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/documents">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-4 w-64 px-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  );
}
