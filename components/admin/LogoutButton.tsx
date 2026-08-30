"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/admin";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="text-sm font-medium text-charcoal/60 hover:text-sage-700"
    >
      Sign out
    </button>
  );
}
