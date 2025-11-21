import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  education: string | null;
  skills: string[];
  experience: string | null;
  created_at: string;
}

interface GeneratePDFProps {
  beneficiary: Beneficiary;
}

const FIELD_OPTIONS = [
  { value: "full_name", label: "Full Name" },
  { value: "phone_number", label: "Phone Number" },
  { value: "email", label: "Email" },
  { value: "address", label: "Address" },
  { value: "date_of_birth", label: "Date of Birth" },
  { value: "gender", label: "Gender" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "experience", label: "Experience" },
  { value: "created_at", label: "Registration Date" },
];

const GeneratePDF = ({ beneficiary }: GeneratePDFProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "full_name",
    "phone_number",
    "skills",
  ]);

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(0, 150, 136); // Teal color
      doc.text("Beneficiary Profile", 20, 20);
      
      // Add horizontal line
      doc.setDrawColor(0, 150, 136);
      doc.line(20, 25, 190, 25);
      
      let yPosition = 40;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      // Add selected fields
      selectedFields.forEach((field) => {
        const option = FIELD_OPTIONS.find((opt) => opt.value === field);
        if (!option) return;

        const value = beneficiary[field as keyof Beneficiary];
        
        if (value) {
          doc.setFont("helvetica", "bold");
          doc.text(`${option.label}:`, 20, yPosition);
          
          doc.setFont("helvetica", "normal");
          let displayValue = "";
          
          if (field === "skills" && Array.isArray(value)) {
            displayValue = value.join(", ");
          } else if (field === "date_of_birth" || field === "created_at") {
            displayValue = new Date(value as string).toLocaleDateString();
          } else {
            displayValue = String(value);
          }
          
          // Handle long text wrapping
          const splitText = doc.splitTextToSize(displayValue, 160);
          doc.text(splitText, 20, yPosition + 7);
          
          yPosition += 7 + (splitText.length * 7);
          yPosition += 5; // Add spacing between fields
        }
      });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        20,
        280
      );

      // Save the PDF
      doc.save(`${beneficiary.full_name.replace(/\s+/g, "_")}_profile.pdf`);

      toast({
        title: "Success!",
        description: "PDF generated successfully.",
      });
      
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="w-4 h-4 mr-2" />
          Generate PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate PDF Profile</DialogTitle>
          <DialogDescription>
            Select the fields you want to include in the PDF
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {FIELD_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selectedFields.includes(option.value)}
                  onCheckedChange={() => handleFieldToggle(option.value)}
                />
                <Label htmlFor={option.value} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          <Button
            onClick={generatePDF}
            className="w-full"
            disabled={selectedFields.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratePDF;
