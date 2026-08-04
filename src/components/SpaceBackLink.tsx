"use client";

import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Link } from "@/i18n/navigation";

export function SpaceBackLink({
  spacesLabel,
  solutionsLabel,
}: {
  spacesLabel: string;
  solutionsLabel?: string;
}) {
  const searchParams = useSearchParams();
  const fromSolutions = solutionsLabel && searchParams.get("from") === "solutions";

  return (
    <Link
      href={fromSolutions ? "/#solutions" : "/#espaces"}
      className="inline-flex items-center gap-2 font-manrope text-[15px] font-semibold text-welcome-body transition-colors hover:text-welcome-gold"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {fromSolutions ? solutionsLabel : spacesLabel}
    </Link>
  );
}
