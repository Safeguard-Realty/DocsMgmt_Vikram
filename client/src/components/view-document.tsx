import { Link, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

const DocumentPage = ({ id }) => {
    const { data: document, error } = useQuery({
        queryKey: [`/api/documents/${id}`],
        queryFn: async () => {
            if (!id) throw new Error("Document ID is missing");
            const response = await fetch(`/api/documents/${id}`);
            if (!response.ok) throw new Error("Failed to fetch document");
            return response.json();
        },
        enabled: !!id, // ✅ Only fetch if id exists
    });

    if (error) return <div>Error loading document</div>;
    if (!document) return <div>Loading...</div>;

    // File URL endpoint
    const fileUrl = `/api/documents/${id}/file`;

    return (
        <Layout>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p>Status: {document.status}</p>
            <p>Description: {document.description}</p>

            {/* Render file */}
            {document.fileUrl && document.fileUrl.startsWith("data:") ? (
                document.fileUrl.startsWith("data:application/pdf") ? (
                    // Render PDF using iframe
                    <iframe
                        src={document.fileUrl}
                        title={document.title}
                        width="100%"
                        height="600px"
                        className="rounded-lg shadow-lg"
                    />
                ) : document.fileUrl.startsWith("data:image") ? (
                    // Render Image with uniform size
                    <div className="flex justify-center items-center">
                        <img
                            src={document.fileUrl}
                            alt={document.title}
                            className="rounded-lg shadow-lg object-contain"
                            style={{
                                maxWidth: "600px",
                                maxHeight: "400px",
                                width: "100%",
                                height: "auto",
                            }}
                        />
                    </div>
                ) : (
                    <p>Unsupported file format</p>
                )
            ) : (
                <p>File preview not available</p>
            )}



            <Button onClick={() => window.history.back()}>Go Back</Button>
            <Link href={`/processdoc/${id}`}>
                <Button>Process Document</Button>
            </Link>
        </Layout>
    );
};

export default DocumentPage;
