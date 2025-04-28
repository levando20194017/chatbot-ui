"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Check } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import { rag_user, status } from "@/utils/const";

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  knowledge_base_id: number;
  created_at: string;
  updated_at: string;
}
export interface UserCreate {
  username: string;
  email: string;
  password: string;
  knowledge_base_id: number;
}

export default function APIKeysPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [formData, setFormData] = useState<UserCreate>({
    email: "",
    username: "",
    password: "",
    knowledge_base_id: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const userLogin = JSON.parse(localStorage.getItem(rag_user) || "{}");

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetListKnowledgeBase = async () => {
    const url = `/api/knowledge-base`;
    try {
      const response = await api.get(url);
      const data = response;
      if (data?.length > 0) {
        setKnowledgeBase(data);
        setFormData({
          ...formData,
          knowledge_base_id: data[0].id,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch knowledge base",
        variant: "destructive",
      });
    }
  };

  const handleGetUsers = async () => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: String(pageIndex),
      page_size: String(pageSize),
    }).toString();
    const url = `/api/auth/get-users?${query}`;
    try {
      const response = await api.get(url);
      if (response.status === status.SUCCESS) {
        const data = response.data;
        setUsers(data);
        const pagination = response.pagination;
        setTotalPages(pagination.total_pages);
        setTotalUsers(pagination.total);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, [pageIndex, pageSize]);

  useEffect(() => {
    handleGetListKnowledgeBase();
  }, []);

  // create User
  const createUser = async () => {
    if (
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.knowledge_base_id
    ) {
      toast({
        title: "Error",
        description: "Please enter a name for the user",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post("/api/auth/create-user", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        knowledge_base_id: formData.knowledge_base_id,
      });
      if (response.status === status.SUCCESS) {
        handleGetUsers();
        setIsDialogOpen(false);
        setFormData({
          email: "",
          username: "",
          password: "",
          knowledge_base_id: 0,
        });
        toast({
          title: "Success",
          description: "user created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // delete User
  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await api.delete(`/api/auth/delete-user/${id}`);

      if (response.status === status.SUCCESS) {
        handleGetUsers();
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  //update User status
  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/auth/update-user/${id}`, {
        is_active: !currentStatus,
      });
      if (response.status === status.SUCCESS) {
        handleGetUsers();
        toast({
          title: "Success",
          description: "Update user successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  //update User admin
  const toggleUserAdmin = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/auth/update-user/${id}`, {
        is_admin: !currentStatus,
      });
      if (response.status === status.SUCCESS) {
        handleGetUsers();
        toast({
          title: "Success",
          description: "Update user successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const checkValidation = () => {
    const { email, username, password, knowledge_base_id } = formData;
    return (
      email.trim() !== "" &&
      username.trim() !== "" &&
      password.trim() !== "" &&
      knowledge_base_id > -1
    );
  };

  return (
    <DashboardLayout>
      <div className="lg:container w-full mx-auto pt-10 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="name"
                    type="email"
                    value={formData?.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    id="name"
                    value={formData?.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData?.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="knowledgeBase">Knowledge Base</Label>
                  <select
                    id="knowledgeBase"
                    value={formData?.knowledge_base_id}
                    style={{ height: "40px" }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        knowledge_base_id: Number(e.target.value),
                      })
                    }
                    className="border rounded px-2 py-1"
                  >
                    {knowledgeBase.map((kb) => (
                      <option key={kb.id} value={kb.id}>
                        {kb.name}
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createUser}
                    disabled={isCreating || !checkValidation()}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="col-span-2 flex justify-center py-8 flex-1 items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Is active</TableHead>
                  <TableHead>Is admin</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {user.email}
                      </code>
                    </TableCell>
                    <TableCell>
                      {userLogin?.id !== user.id ? (
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() =>
                            toggleUserStatus(user.id, user.is_active)
                          }
                        />
                      ) : userLogin?.is_active ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell>
                      {userLogin?.id !== user.id ? (
                        <Switch
                          checked={user.is_superuser}
                          onCheckedChange={() =>
                            toggleUserAdmin(user.id, user.is_superuser)
                          }
                        />
                      ) : userLogin?.is_admin ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                      {/* {user.is_superuser ? "Yes" : "No"} */}
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {userLogin?.id !== user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-col lg:flex-row justify-center items-center p-4 relative gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={pageIndex === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index}
                    variant={pageIndex === index + 1 ? "default" : "outline"}
                    onClick={() => setPageIndex(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    setPageIndex((prev) => Math.min(prev + 2, totalPages))
                  }
                  disabled={pageIndex === totalPages}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
              <div className="lg:absolute lg:right-8 text-center">
                Total: {totalUsers}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
