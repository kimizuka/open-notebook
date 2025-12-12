"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthTokenGetter } from "@/lib/api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // APIクライアントにトークン取得関数を設定
    setAuthTokenGetter(async () => {
      return await getToken();
    });
  }, [getToken]);

  return <>{children}</>;
}
