import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { MoreHorizontal, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const statusColors = {
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
} as const;

export function DocumentList() {
  const { toast } = useToast();
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/change-docstatus/${id}`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Status updated",
        description: "Document status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Region</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents?.map((doc) => (
          <TableRow key={doc._id}>
            <TableCell className="font-medium">{doc.title}</TableCell>
            <TableCell className="capitalize">{doc.type}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={`${statusColors[doc.status as keyof typeof statusColors]
                  } text-white`}
              >
                {doc.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(doc.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>{doc.metadata?.region || "-"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <Link href={`/documents/${doc._id}`} passHref>
                  <DropdownMenuItem asChild>
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DropdownMenuItem>
                </Link>
                  <DropdownMenuItem
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = doc.fileUrl;
                      a.download = doc.title;
                      a.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  {doc.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: doc._id,
                          status: "pending",
                        })
                      }
                    >
                      Submit for Review
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
