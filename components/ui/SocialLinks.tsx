import { SocialIcon } from "@/components/ui/SocialIcon";
import { cn } from "@/lib/utils";

type Social = { label: string; href: string; icon: string };

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function isConfigured(href: string) {
  return Boolean(href) && href !== "#" && href !== "/";
}

export function SocialLinks({
  socials,
  className,
  itemClassName,
  iconClassName,
}: {
  socials: Social[];
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
}) {
  const links = socials.filter((s) => isConfigured(s.href));
  if (!links.length) return null;

  return (
    <div className={cn("flex gap-2.5", className)}>
      {links.map((s) => {
        const external = isExternal(s.href);
        return (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-xl border border-line bg-charcoal-light text-snow/70 transition-colors hover:border-gold/40 hover:text-gold",
              itemClassName,
            )}
          >
            <SocialIcon name={s.icon} className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}
