"use client";

import { api } from "@/lib/api";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Breadcrumb = () => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const paths = pathname.split("/").filter(Boolean);

      const breadcrumbs: any[] = [];

      for (let index = 0; index < paths.length; index++) {
        const path = paths[index];
        const href = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;

        let displayLabel =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

        const previousPath = paths[index - 1];
        if (previousPath === "chat" || previousPath === "knowledge") {
          const fetchedTitle = await fetchTitleFromId(path, previousPath);
          displayLabel = fetchedTitle || displayLabel;
        }

        breadcrumbs.push({
          href,
          label: displayLabel,
          isLast,
        });
      }

      setBreadcrumbs(breadcrumbs);
    };

    generateBreadcrumbs();
  }, [pathname]);

  const fetchTitleFromId = async (id: string, path: string) => {
    try {
      if (path === "chat") {
        const data = await api.get(`/api/chat/${id}`);
        return data.title;
      }
      if (path === "knowledge") {
        const data = await api.get(`/api/knowledge-base/${id}`);
        return data.name;
      }
    } catch (error) {
      console.error("Failed to fetch title:", error);
      return id; // fallback là id
    }
  };

  if (pathname === "/") return null;

  return (
    <nav className="flex items-center space-x-2 text-base text-muted-foreground">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          {breadcrumb.isLast ? (
            <span className="text-foreground font-medium">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
