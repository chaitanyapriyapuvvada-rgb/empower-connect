import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const providerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().optional(),
  industry: z.string().optional(),
});

const jobSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  title: z.string().min(1, "Job title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  requiredSkills: z.array(z.string()).min(1, "At least one skill required"),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  openings: z.number().min(1, "At least 1 opening required"),
});

const JOB_CATEGORIES = [
  { value: "construction_labor", label: "Construction & Labor" },
  { value: "domestic_housekeeping", label: "Domestic & Housekeeping" },
  { value: "manufacturing_production", label: "Manufacturing & Production" },
  { value: "retail_food_services", label: "Retail & Food Services" },
  { value: "logistics_delivery", label: "Logistics & Delivery" },
  { value: "security_auxiliary", label: "Security & Auxiliary" },
  { value: "agriculture_farming", label: "Agriculture & Farming" },
  { value: "waste_management", label: "Waste Management" },
  { value: "patient_care", label: "Patient Care" },
];

const SKILLS = ["Plumbing", "Carpenter", "Electrician", "Security Guard", "Maid", "Cook"];

const ProvidersManagement = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const providerForm = useForm({
    resolver: zodResolver(providerSchema),
  });

  const jobForm = useForm({
    resolver: zodResolver(jobSchema),
  });

  useEffect(() => {
    fetchProviders();
    fetchJobs();
  }, []);

  const fetchProviders = async () => {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProviders(data || []);
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        providers (company_name)
      `)
      .order("created_at", { ascending: false });

    if (!error) setJobs(data || []);
  };

  const onSubmitProvider = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("providers").insert({
        user_id: user.id,
        company_name: data.companyName,
        contact_person: data.contactPerson,
        phone_number: data.phoneNumber,
        email: data.email,
        address: data.address || null,
        industry: data.industry || null,
      });

      if (error) throw error;

      toast({ title: "Success!", description: "Provider added successfully." });
      setAddProviderOpen(false);
      providerForm.reset();
      fetchProviders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitJob = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("jobs").insert({
        user_id: user.id,
        provider_id: data.providerId,
        title: data.title,
        category: data.category,
        description: data.description,
        required_skills: selectedSkills,
        location: data.location || null,
        salary_range: data.salaryRange || null,
        openings: data.openings,
      });

      if (error) throw error;

      toast({ title: "Success!", description: "Job opening added successfully." });
      setAddJobOpen(false);
      jobForm.reset();
      setSelectedSkills([]);
      fetchJobs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="providers">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="providers">Providers</TabsTrigger>
        <TabsTrigger value="jobs">Job Openings</TabsTrigger>
      </TabsList>

      <TabsContent value="providers">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Providers List</CardTitle>
                <CardDescription>Manage companies providing job opportunities</CardDescription>
              </div>
              <Dialog open={addProviderOpen} onOpenChange={setAddProviderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Provider</DialogTitle>
                    <DialogDescription>Enter the provider company details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={providerForm.handleSubmit(onSubmitProvider)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input {...providerForm.register("companyName")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Person *</Label>
                        <Input {...providerForm.register("contactPerson")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input {...providerForm.register("phoneNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input type="email" {...providerForm.register("email")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Input {...providerForm.register("industry")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Textarea {...providerForm.register("address")} rows={3} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Adding..." : "Add Provider"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No providers added yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Industry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.company_name}</TableCell>
                      <TableCell>{provider.contact_person}</TableCell>
                      <TableCell>{provider.phone_number}</TableCell>
                      <TableCell>{provider.email}</TableCell>
                      <TableCell>{provider.industry || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="jobs">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Job Openings</CardTitle>
                <CardDescription>Current job opportunities from providers</CardDescription>
              </div>
              <Dialog open={addJobOpen} onOpenChange={setAddJobOpen}>
                <DialogTrigger asChild>
                  <Button disabled={providers.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Job Opening</DialogTitle>
                    <DialogDescription>Create a new job opportunity</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={jobForm.handleSubmit(onSubmitJob)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider *</Label>
                      <Select onValueChange={(value) => jobForm.setValue("providerId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title *</Label>
                        <Input {...jobForm.register("title")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select onValueChange={(value) => jobForm.setValue("category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input {...jobForm.register("location")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Salary Range</Label>
                        <Input {...jobForm.register("salaryRange")} placeholder="e.g., 15,000 - 20,000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Openings *</Label>
                        <Input type="number" {...jobForm.register("openings", { valueAsNumber: true })} defaultValue={1} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Required Skills *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {SKILLS.map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant={selectedSkills.includes(skill) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedSkills((prev) =>
                                prev.includes(skill)
                                  ? prev.filter((s) => s !== skill)
                                  : [...prev, skill]
                              );
                            }}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Job Description *</Label>
                      <Textarea {...jobForm.register("description")} rows={4} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || selectedSkills.length === 0}>
                      {loading ? "Adding..." : "Add Job Opening"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No job openings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription>{job.providers?.company_name}</CardDescription>
                        </div>
                        <Badge>{job.openings} openings</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills?.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                        {job.location && (
                          <p className="text-sm text-muted-foreground">📍 {job.location}</p>
                        )}
                        {job.salary_range && (
                          <p className="text-sm text-muted-foreground">💰 {job.salary_range}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProvidersManagement;
