import HeroScene from "@/components/HeroScene";
import Collection from "@/components/Collection";
import Order from "@/components/Order";
import FloatingCta from "@/components/FloatingCta";
import { footer } from "@/src/content";

export default function Home() {
  return (
    <>
      <main>
        <HeroScene />
        <Collection />
        <Order />
      </main>
      <footer className="border-t border-[#1E1C19] bg-[#0B0B0C] text-[#8F877B]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-[22px] font-light tracking-[.34em] text-[#EDE6DA] uppercase">{footer.brand}</p>
          <p className="font-sans text-[12px] tracking-[.08em]">{footer.note}</p>
        </div>
      </footer>
      <FloatingCta />
    </>
  );
}
