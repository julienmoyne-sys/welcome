import type { Metadata } from "next";

import openSpaceImage from "@/assets/open-space-2026.png";
import { SpacePresentationPage } from "@/components/SpacePresentationPage";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";

const PATH = "/open-space";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: PATH,
    namespace: "metadata.openSpace",
  });
}

export default async function OpenSpacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <SpacePresentationPage
      locale={locale}
      path={PATH}
      namespace="openSpacePage"
      image={openSpaceImage}
      kind="openSpace"
    />
  );
}
