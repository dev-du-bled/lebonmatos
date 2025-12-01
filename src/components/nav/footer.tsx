"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "../../assets/logo/mini-dark.svg";
import Image from "next/image";

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "w-full bg-[#19191A] supports-backdrop-filter:bg-[#19191A] backdrop-blur text-muted-foreground",
        className,
      )}
    >
      <div className="mx-auto wide-lock px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left: logo + copyright */}
          <div className="flex flex-col gap-4 justify-center">
            <Link href="/" aria-label="Accueil" className="inline-block shrink-0">
              <Image src={Logo} width={132} height={55} alt="LeBonMatos" className="block" />
            </Link>

            <p className="text-sm text-white">© LeBonMatos - {new Date().getFullYear()}</p>
          </div>

          {/* Middle: services */}
          <nav aria-label="Nos services" className="flex flex-col justify-center">
            <h3 className="text-white font-semibold mb-3">Nos Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/annonces" className="text-muted-foreground hover:text-white transition-colors">
                  Annonces
                </Link>
              </li>
              <li>
                <Link href="/configurateur" className="text-muted-foreground hover:text-white transition-colors">
                  Configurateur
                </Link>
              </li>
              <li>
                <Link href="/comparateur" className="text-muted-foreground hover:text-white transition-colors">
                  Comparateur
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: info links */}
          <nav aria-label="Informations" className="flex flex-col items-start md:items-end justify-center">
            <h3 className="sr-only">Informations</h3>
            <ul className="space-y-2 text-white font-semibold">
              <li>
                <Link href="/a-propos" className="hover:underline">
                  A propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/politique_confidentialite" className="hover:underline">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
