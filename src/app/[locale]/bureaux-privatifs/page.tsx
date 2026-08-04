import type { Metadata } from "next";

import privateOfficesImage from "@/assets/bureaux-privatifs.jpg";
import { SpacePresentationPage } from "@/components/SpacePresentationPage";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";

const PATH = "/bureaux-privatifs";

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
    namespace: "metadata.privateOffices",
  });
}

export default async function PrivateOfficesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <SpacePresentationPage
      locale={locale}
      path={PATH}
      namespace="privateOfficesPage"
      image={privateOfficesImage}
      kind="privateOffices"
    />
  );
}
