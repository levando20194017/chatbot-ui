"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { DocumentUploadSteps } from "@/components/knowledge-base/document-upload-steps";
import { DocumentList } from "@/components/knowledge-base/document-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { getUserStorage } from "@/utils/const";

export default function KnowledgeBasePage() {
  const params = useParams();
  const knowledgeBaseId = parseInt(params.id as string);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const userLogin = getUserStorage();
  const router = useRouter();
  if (!userLogin?.is_admin) {
    router.push("/chat/new");
  }

  const handleUploadComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setDialogOpen(false);
  }, []);

  if (!userLogin?.is_admin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center items-start mb-8">
        <h2 className="text-3xl font-bold mt-6">Knowledge Base</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-auto">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
              <DialogDescription>
                Upload a document to your knowledge base. Supported formats:
                PDF, DOCX, Markdown, Text and Excel files.
              </DialogDescription>
            </DialogHeader>
            <DocumentUploadSteps
              knowledgeBaseId={knowledgeBaseId}
              onComplete={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        <DocumentList key={refreshKey} knowledgeBaseId={knowledgeBaseId} />
      </div>
    </DashboardLayout>
  );
}
