"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Book,
  MessageSquare,
  LogOut,
  Menu,
  User,
  Edit,
  X,
  Plus,
} from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import { rag_token, rag_user } from "@/utils/const";
import { api, ApiError } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import { truncateString } from "@/lib/utils";
import Cookies from "js-cookie";

interface Chat {
  id: number;
  title: string;
  created_at: string;
  messages: Message[];
  knowledge_base_ids: number[];
}

interface Message {
  id: number;
  content: string;
  is_bot: boolean;
  created_at: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const { toast } = useToast();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [userLogin, setUserLogin] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let userStr = Cookies.get(rag_user);
      let parsedUser = null;

      if (userStr) {
        try {
          parsedUser = JSON.parse(userStr);
        } catch (error) {
          console.error("Failed to parse rag_user cookie:", error);
        }
      }

      setUserLogin(parsedUser);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const data = await api.get("/api/chat");
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(rag_token);
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(rag_token);
    localStorage.removeItem(rag_user);
    router.push("/login");
  };

  const handeChangePassword = () => {
    router.push("/change-password");
  };

  const navigation = userLogin?.is_admin
    ? [
      { id: 1, name: "Knowledge Base", href: "/knowledge", icon: Book },
      { id: 2, name: "Chat", href: "/chat", icon: MessageSquare },
      { id: 3, name: "Manage Users", href: "/manage-users", icon: User },
    ]
    : chats.map((chat) => ({
      id: chat.id,
      name: truncateString(chat.title, 40),
      href: `/chat/${chat.id}`,
      icon: MessageSquare,
    }));

  const handleToggleDropdown = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setOpenDropdownId((prevId) => (prevId === id ? 0 : id));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await api.delete(`/api/chat/${id}`);
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 m-4 z-50">
        {!isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md bg-primary text-primary-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {isMobileMenuOpen && (
          <X
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute right-2 top-5 lg:hidden"
          />
        )}
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center border-b pl-8">
            <Link
              href={userLogin?.is_admin ? "/" : "/chat/new"}
              className="flex items-center text-lg font-semibold hover:text-primary transition-colors"
            >
              <img
                src="/logo_TNG-removebg.png"
                alt="Logo"
                className="w-10 h-10 rounded-lg"
              />
              TNG AI Chat
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4">
            {!userLogin?.is_admin && (
              <div className="mb-4">
                <a
                  href="/chat/new"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </a>
              </div>
            )}
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-sm"
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive
                      ? "text-primary scale-110"
                      : "group-hover:scale-110"
                      }`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {!userLogin?.is_admin ? (
                    <span
                      className="absolute right-0"
                      onClick={(e) => handleToggleDropdown(e, item.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </span>
                  ) : (
                    isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )
                  )}
                  {/* Dropdown menu */}
                  {openDropdownId === item.id && (
                    <div className="absolute right-2 top-8 w-32 bg-white border shadow-lg rounded-md z-10">
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
          {/* User profile and logout */}
          <div className="border-t p-4 space-y-4">
            <button
              onClick={handeChangePassword}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium  hover:bg-destructive/10 transition-colors duration-200"
            >
              <Edit className="mr-3 h-4 w-4" />
              Change password
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen flex flex-col py-6 px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            <Breadcrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export const dashboardConfig = {
  mainNav: [],
  sidebarNav: [
    {
      title: "Knowledge Base",
      href: "/knowledge",
      icon: "database",
    },
    {
      title: "Chat",
      href: "/chat",
      icon: "messageSquare",
    },
    // {
    //   title: "API Keys",
    //   href: "/api-keys",
    //   icon: "key",
    // },
  ],
};
