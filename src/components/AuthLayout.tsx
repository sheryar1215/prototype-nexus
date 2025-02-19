
import { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md space-y-8 rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Prototype</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
