import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Briefcase, TrendingUp } from "lucide-react";

interface Match {
  beneficiary: any;
  job: any;
  matchingSkills: string[];
  matchPercentage: number;
}

const SkillMatching = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: beneficiaries } = await supabase
        .from("beneficiaries")
        .select("*");

      const { data: jobs } = await supabase
        .from("jobs")
        .select(`
          *,
          providers (company_name)
        `)
        .eq("status", "active");

      if (!beneficiaries || !jobs) return;

      const matchResults: Match[] = [];

      beneficiaries.forEach((beneficiary) => {
        jobs.forEach((job) => {
          const matchingSkills = beneficiary.skills.filter((skill: string) =>
            job.required_skills.includes(skill)
          );

          if (matchingSkills.length > 0) {
            const matchPercentage = Math.round(
              (matchingSkills.length / job.required_skills.length) * 100
            );

            matchResults.push({
              beneficiary,
              job,
              matchingSkills,
              matchPercentage,
            });
          }
        });
      });

      // Sort by match percentage
      matchResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

      setMatches(matchResults);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Finding matches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Skill Matching Results
        </CardTitle>
        <CardDescription>
          Beneficiaries matched with job openings based on their skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No matches found. Add beneficiaries and job openings to see matches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <CardTitle className="text-lg">{match.beneficiary.full_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">{match.job.title}</span>
                        <span className="text-sm">• {match.job.providers?.company_name}</span>
                      </div>
                    </div>
                    <Badge
                      variant={match.matchPercentage >= 75 ? "default" : "secondary"}
                      className="text-lg px-3 py-1"
                    >
                      {match.matchPercentage}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Matching Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingSkills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-success/10 text-success border-success/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">All Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.job.required_skills.map((skill: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant={match.matchingSkills.includes(skill) ? "default" : "outline"}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📱 {match.beneficiary.phone_number}</span>
                      {match.beneficiary.email && <span>✉️ {match.beneficiary.email}</span>}
                      {match.job.salary_range && <span>💰 {match.job.salary_range}</span>}
                      {match.job.location && <span>📍 {match.job.location}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillMatching;
