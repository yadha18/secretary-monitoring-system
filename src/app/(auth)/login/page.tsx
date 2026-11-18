import { Suspense } from "react";
import { ClipboardList } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Login | Secretary Monitoring System" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardList className="size-6" />
          </div>
          <h1 className="text-xl font-semibold text-primary">Secretary Monitoring System</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
            <CardDescription>Gunakan akun Administrator Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
