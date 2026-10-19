import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { collection, formatPrice, products, type Photo } from "@/src/content";

// Renders the photo if the file is in public/, otherwise a captioned placeholder.
function Shot({ photo, sizes, className }: { photo: Photo; sizes: string; className: string }) {
  const exists = existsSync(join(process.cwd(), "public", photo.src));
  return (
    <div className={`relative overflow-hidden bg-[#E2DCD2] ${className}`}>
      {exists ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center px-2 text-center font-sans text-[10px] tracking-[.32em] text-[#8A7F70] uppercase">
          {photo.placeholder}
        </span>
      )}
    </div>
  );
}

export default function Collection() {
  const { eyebrow, title } = collection;
  return (
    <section className="bg-[#EFEBE2] py-20 md:py-32">
      <div className="mx-auto max-w-[1240px] px-6">
        <p className="font-sans text-[10.5px] tracking-[.4em] text-[#8A7F70] uppercase">{eyebrow}</p>
        <h2 className="mt-5 font-serif text-[clamp(44px,6vw,68px)] leading-none font-light text-[#151311]">
          {title.before} <em>{title.amp}</em> {title.after}
        </h2>

        <div className="mt-14 flex flex-col gap-20 md:mt-20 md:gap-32">
          {products.map((p, i) => (
            <article key={p.id} className="grid gap-10 md:grid-cols-2 md:items-center md:gap-20">
              <div className={`grid grid-cols-2 gap-4 ${i % 2 ? "md:order-last" : ""}`}>
                <Shot
                  photo={p.photos.main}
                  sizes="(min-width: 1240px) 556px, (min-width: 768px) 45vw, 100vw"
                  className="col-span-2 aspect-square"
                />
                {p.photos.thumbs.map((photo) => (
                  <Shot
                    key={photo.src}
                    photo={photo}
                    sizes="(min-width: 1240px) 270px, (min-width: 768px) 22vw, 50vw"
                    className="aspect-square"
                  />
                ))}
              </div>

              <div>
                <h3 className="font-serif text-[32px] leading-tight font-light text-[#151311] md:text-[40px]">{p.name}</h3>
                <p className="mt-5 max-w-[460px] font-sans text-[15px] leading-[1.8] font-light text-[#5A5247]">
                  {p.description}
                </p>
                {p.price !== null && (
                  <p className="mt-6 font-serif text-[28px] text-[#151311]">{formatPrice(p.price)}</p>
                )}
                <Link
                  href={`?produit=${p.id}#commande`}
                  data-product-cta
                  className="mt-8 flex h-14 w-full items-center justify-center bg-[#0B0B0C] px-10 font-sans text-[11.5px] font-medium tracking-[.3em] text-[#EFEBE2] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0B0C] md:w-fit"
                >
                  {p.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
