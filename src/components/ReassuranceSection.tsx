import {
  Bike,
  BriefcaseBusiness,
  CalendarDays,
  CarFront,
  Route,
  Sparkles,
  TramFront,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = {
  atmosphere: Sparkles,
  access: Route,
  profiles: Users,
  workspace: BriefcaseBusiness,
  tram: TramFront,
  bike: Bike,
  car: CarFront,
  history: CalendarDays,
} as const;

type ReassuranceItem = {
  icon: keyof typeof ICONS;
  title: string;
  text: string;
};

export function ReassuranceSection() {
  const t = useTranslations("reassurance");
  const items = t.raw("items") as ReassuranceItem[];

  return (
    <section className="relative z-10 -mt-16 w-full px-4 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1280px] rounded-[20px] bg-welcome-white px-6 py-8 shadow-[0_8px_40px_-12px_rgba(11,11,11,0.08)] sm:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {items.map((item, index) => {
            const Icon = ICONS[item.icon];
            const isLast = index === items.length - 1;

            return (
              <div
                key={item.title}
                className={`flex flex-col items-center text-center lg:px-6 ${
                  !isLast ? "lg:border-r lg:border-welcome-black/10" : ""
                }`}
              >
                <Icon className="text-welcome-gold" size={28} strokeWidth={1.5} />
                <h3 className="mt-3 font-manrope text-[16px] font-semibold text-welcome-black">
                  {item.title}
                </h3>
                <p className="mt-1 font-inter text-[15px] font-normal text-welcome-black/60">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
