import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Briefcase, TrendingUp, LogOut } from "lucide-react";
import AddBeneficiary from "@/components/AddBeneficiary";
import BeneficiariesList from "@/components/BeneficiariesList";
import ProvidersManagement from "@/components/ProvidersManagement";
import SkillMatching from "@/components/SkillMatching";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NGO Dashboard</h1>
              <p className="text-sm text-muted-foreground">Beneficiary Management System</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Add Beneficiary
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Beneficiaries
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Skill Matching
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <AddBeneficiary />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <BeneficiariesList />
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <ProvidersManagement />
          </TabsContent>

          <TabsContent value="matching" className="space-y-4">
            <SkillMatching />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
