import type { Metadata } from "next";

import meetingRoomImage from "@/assets/salle-reunion.jpg";
import { SpacePresentationPage } from "@/components/SpacePresentationPage";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";

const PATH = "/salle-de-reunion";

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
    namespace: "metadata.meetingRoom",
  });
}

export default async function MeetingRoomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <SpacePresentationPage
      locale={locale}
      path={PATH}
      namespace="meetingRoomPage"
      image={meetingRoomImage}
      kind="meetingRoom"
    />
  );
}
