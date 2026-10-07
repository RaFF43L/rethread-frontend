import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { HeaderUserMenu } from "@/features/products/components/HeaderUserMenu";

export function SiteHeader() {
  return (
    <header className="w-full bg-surface border-b border-line">
      <div className="px-4 md:px-14">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between py-3 md:py-4">
          <Link
            href="/"
            className="shrink-0"
            aria-label="Segunda Aura — página inicial"
          >
            {/* Light theme logo (original) */}
            <Image
              src="/logo-segunda-aura.png"
              alt="Segunda Aura"
              width={400}
              height={150}
              priority
              className="block dark:hidden h-14 md:h-24 w-auto object-contain"
            />
            {/* Dark theme logo (light lettering, transparent background) */}
            <Image
              src="/logo-segunda-aura-dark.png"
              alt="Segunda Aura"
              width={400}
              height={150}
              priority
              className="hidden dark:block h-14 md:h-24 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <HeaderUserMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
