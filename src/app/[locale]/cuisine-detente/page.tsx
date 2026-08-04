import type { Metadata } from "next";

import kitchenLoungeImage from "@/assets/cuisine-detente.jpg";
import { SpacePresentationPage } from "@/components/SpacePresentationPage";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";

const PATH = "/cuisine-detente";

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
    namespace: "metadata.kitchenLounge",
  });
}

export default async function KitchenLoungePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <SpacePresentationPage
      locale={locale}
      path={PATH}
      namespace="kitchenLoungePage"
      image={kitchenLoungeImage}
      kind="kitchenLounge"
    />
  );
}
