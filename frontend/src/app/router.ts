import { useState, useEffect } from "react";

export type PagePath = "/today" | "/calendar" | "/browse" | "/stats";

const VALID_PATHS: PagePath[] = ["/today", "/calendar", "/browse", "/stats"];

function getHashPath(): PagePath {
  const hash = window.location.hash.slice(1);
  return (VALID_PATHS as string[]).includes(hash) ? (hash as PagePath) : "/today";
}

export function useRouter() {
  const [path, setPath] = useState<PagePath>(getHashPath);

  useEffect(() => {
    const handler = () => setPath(getHashPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return { path };
}
