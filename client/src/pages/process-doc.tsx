import { Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import React from "react";

interface ProcessDocProps {
  id: string;
}

const ProcessDoc: React.FC<ProcessDocProps> = ({ id }) => {
  console.log(id);
  
  // Base URLs from env variables (Vite)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const ocrApiBaseUrl = import.meta.env.VITE_OCR_API_URL || "http://127.0.0.1:5120";

  const { data: document, error } = useQuery({
    queryKey: [`/api/documents/${id}`],
    queryFn: async () => {
      if (!id) throw new Error("Document ID is missing");
      const response = await fetch(`${apiUrl}/api/documents/${id}`);
      if (!response.ok) throw new Error("Failed to fetch document");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: ocrResult, error: ocrError } = useQuery({
    queryKey: [`/api/ocr/${id}`],
    queryFn: async () => {
      if (!id) throw new Error("Document ID is missing");

      // Use the dynamically set apiUrl for the image file
      const imageUrl = `${apiUrl}/api/documents/${id}/file`;
      const params = new URLSearchParams({
        image_url: imageUrl, // URLSearchParams automatically encodes it
        doc_type: "aadhar",
        max_retries: "3",
      });

      // Build the OCR API URL using the environment variable
      const ocrApiUrl = `${ocrApiBaseUrl}/api/v1/ocr/process-document?${params.toString()}`;

      const response = await fetch(ocrApiUrl, { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch OCR results");

      return response.json();
    },
    enabled: !!id, // Runs only when `id` is available
  });

  if (error) return <div>Error loading document</div>;
  if (!document) return <div>Loading...</div>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold">{document.title}</h1>
      <p>Status: {document.status}</p>
      <p>Description: {document.description}</p>

      {document.fileUrl && document.fileUrl.startsWith("data:") ? (
        document.fileUrl.startsWith("data:application/pdf") ? (
          <iframe
            src={document.fileUrl}
            title={document.title}
            width="100%"
            height="600px"
            className="rounded-lg shadow-lg"
          />
        ) : document.fileUrl.startsWith("data:image") ? (
          <div className="flex justify-center items-center">
            <img
              src={document.fileUrl}
              alt={document.title}
              className="rounded-lg shadow-lg object-contain"
              style={{ maxWidth: "600px", maxHeight: "400px", width: "100%", height: "auto" }}
            />
          </div>
        ) : (
          <p>Unsupported file format</p>
        )
      ) : (
        <p>File preview not available</p>
      )}

      <h2 className="text-xl font-semibold mt-4">OCR Results</h2>
      {ocrError ? (
        <p className="text-red-500">Error: {ocrError.message}</p>
      ) : !ocrResult ? (
        <p>Loading OCR results...</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded-md mt-2 overflow-auto">
          {JSON.stringify(ocrResult, null, 2)}
        </pre>
      )}

      <Button onClick={() => window.history.back()}>Go Back</Button>
    </Layout>
  );
};

export default ProcessDoc;