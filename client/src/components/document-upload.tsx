import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

interface DocumentUploadProps {
  onSuccess?: () => void;
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Document Category</Label>
          <Select name="category" required onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select document category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="property">Property</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Document Type</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {category === "property" ? (
                <>
                  <SelectItem value="deed">Title Deed</SelectItem>
                  <SelectItem value="contract">Sales Contract</SelectItem>
                  <SelectItem value="mortgage">Mortgage Agreement</SelectItem>
                  <SelectItem value="inspection">Inspection Report</SelectItem>
                </>
              ) : category === "kyc" ? (
                <>
                  <SelectItem value="aadhar">Aadhar Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </>
              ) : null}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="metadata.region"
            placeholder="e.g. New York, USA"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="file">Document File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            required
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, Word, Text, Images
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>
    </form>
  );
}