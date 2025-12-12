import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn forceRedirectUrl="/notebooks" />
    </div>
  );
}