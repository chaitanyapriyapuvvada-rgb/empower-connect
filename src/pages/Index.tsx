import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Heart, TrendingUp, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">NGO Management</span>
          </div>
          <Button onClick={() => navigate("/auth")}>
            Get Started <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Empowering Communities Through Connection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline beneficiary management, connect with job providers, and create meaningful
              employment opportunities for those who need them most.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Beneficiary Management</h3>
              <p className="text-muted-foreground text-sm">
                Easily register and track beneficiaries with comprehensive profiles and skills
                documentation.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg">Provider Network</h3>
              <p className="text-muted-foreground text-sm">
                Connect with companies offering job opportunities and manage employment openings
                effectively.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold text-lg">Smart Matching</h3>
              <p className="text-muted-foreground text-sm">
                Automatically match beneficiaries with suitable jobs based on their skills and
                experience.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 NGO Management System. Making a difference, one connection at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
