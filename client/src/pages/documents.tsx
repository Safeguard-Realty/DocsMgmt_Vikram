import { Layout } from "@/components/layout";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentList } from "@/components/document-list";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DocsStatus } from "@/components/docstatus";

export default function Documents() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your real estate documents
            </p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the system. Fill in the required metadata
                  and select a file to upload.
                </DialogDescription>
              </DialogHeader>
              <DocumentUpload onSuccess={() => setUploadDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <DocsStatus/>
        <DocumentList />
      </div>
    </Layout>
  );
}
