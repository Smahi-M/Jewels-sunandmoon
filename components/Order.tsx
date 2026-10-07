import { existsSync } from "node:fs";
import { join } from "node:path";
import OrderForm from "@/components/OrderForm";
import { order, products } from "@/src/content";

export default function Order() {
  const thumbs = Object.fromEntries(
    products.map((p) => [p.id, existsSync(join(process.cwd(), "public", p.photos.main.src)) ? p.photos.main.src : null]),
  ) as Record<(typeof products)[number]["id"], string | null>;

  return (
    <section id="commande" className="bg-[#0B0B0C] py-20 text-[#EDE6DA] [color-scheme:dark] md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-6 md:grid-cols-[5fr_7fr] md:gap-20">
        <div>
          <p className="font-sans text-[10.5px] tracking-[.4em] text-[#C9AE78] uppercase">{order.eyebrow}</p>
          <h2 className="mt-5 font-serif text-[clamp(44px,6vw,68px)] leading-none font-light">
            {order.title.before} <em>{order.title.em}</em>
          </h2>
          <p className="mt-6 max-w-[360px] font-sans text-[15px] leading-[1.8] font-light text-[#8F877B]">{order.intro}</p>
        </div>
        <OrderForm thumbs={thumbs} />
      </div>
    </section>
  );
}
