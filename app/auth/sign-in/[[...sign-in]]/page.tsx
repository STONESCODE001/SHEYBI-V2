"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { CenteredLayout } from "@/components/layouts";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <CenteredLayout>
        <div className="w-full max-w-md h-[450px] animate-pulse rounded-2xl bg-surface-subtle" />
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <SignIn />
    </CenteredLayout>
  );
}
