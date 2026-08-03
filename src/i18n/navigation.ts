import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/*
 * Ces enveloppes remplacent `next/link` et `next/navigation` dans l'application :
 * elles ajoutent le préfixe de langue courant aux href. Sans elles, un lien vers
 * `/faq` depuis `/de` renverrait le visiteur vers la version française.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
