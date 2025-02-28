import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DocsStatus() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["documentsStatus"],
    queryFn: async () => {
      const res = await fetch("/api/documents/status");
      if (!res.ok) throw new Error("Failed to fetch document status");
      return res.json();
    },
  });


  const categories = Array.isArray(data) ? data : [];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const total = category.subcategories?.length || 0;
          const uploaded =
            category.subcategories?.filter((sub) => sub.uploaded).length || 0;
          const uploadedDocs = category.subcategories?.filter((sub) => sub.uploaded) || [];
          const missingDocs = category.subcategories?.filter((sub) => !sub.uploaded) || [];
          const status = uploaded === total ? "Approved" : "Submitted";

          return (
            <Tooltip key={category.name}>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                    {status === "Approved" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {uploaded}/{total}
                    </div>
                    <p className="text-sm text-muted-foreground">Status: {status}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-md p-3 rounded-md text-sm">
                <p className="font-semibold">Document Status</p>
                {uploadedDocs.length > 0 && (
                  <ul className="mt-1 text-green-500">
                    {uploadedDocs.map((doc) => (
                      <li key={doc.name}>✅ {doc.name}</li>
                    ))}
                  </ul>
                )}
                {missingDocs.length > 0 ? (
                  <ul className="mt-1 text-red-500">
                    {missingDocs.map((doc) => (
                      <li key={doc.name}>❌ {doc.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-500">✅ All documents uploaded</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
