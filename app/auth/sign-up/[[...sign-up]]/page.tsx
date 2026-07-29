"use client";

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { CenteredLayout } from "@/components/layouts";

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <CenteredLayout>
        <div className="w-full max-w-md h-[550px] animate-pulse rounded-2xl bg-surface-subtle" />
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <SignUp />
    </CenteredLayout>
  );
}
