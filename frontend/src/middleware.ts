import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 認証不要のルート
const isPublicRoute = createRouteMatcher(["/login(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // ルートパスは /notebooks にリダイレクト
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/notebooks", req.url));
  }

  // 認証済みユーザーがログインページにアクセスした場合は /notebooks にリダイレクト
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/notebooks", req.url));
  }

  // 公開ルート以外は認証を要求
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.jsの内部ファイルと静的ファイルを除外
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // APIルートは常に実行
    "/(api|trpc)(.*)",
  ],
};