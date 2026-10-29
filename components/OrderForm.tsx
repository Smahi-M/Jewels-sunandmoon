"use client";

import { Suspense, useEffect, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { submitOrder } from "@/app/actions";
import { formatPrice, order as t, products, type Product } from "@/src/content";
import { shipping, type Mode } from "@/src/data/wilayas";
import { MAX_QTY, totals, validate, type OrderErrors, type OrderInput } from "@/src/order";

const EMPTY: OrderInput = { items: {}, name: "", phone: "", wilaya: "", mode: "domicile" };
const WILAYAS = Object.keys(shipping);

const LABEL = "font-sans text-[10px] tracking-[.3em] text-[#8F877B] uppercase";
const INPUT =
  "mt-2 w-full rounded-none border-0 border-b border-[#3A3833] bg-transparent py-3 font-sans text-[16px] text-[#EDE6DA] outline-none placeholder:text-[#4A463F] focus:border-[#C9AE78] aria-invalid:border-[#C2665A]";
const CARD =
  "relative flex cursor-pointer border border-[#3A3833] has-checked:border-[#C9AE78] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#C9AE78]";

// Preselects ?produit=… (product buttons). Isolated in Suspense so the form itself stays prerendered.
function Preselect({ onProduct }: { onProduct: (id: Product["id"]) => void }) {
  const id = useSearchParams().get("produit");
  useEffect(() => {
    if (products.some((p) => p.id === id)) onProduct(id as Product["id"]);
  }, [id, onProduct]);
  return null;
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 font-sans text-[13px] text-[#E08A7E]">
          {error}
        </p>
      )}
    </div>
  );
}

const Check = () => (
  <span
    aria-hidden
    className="absolute top-3 right-3 grid size-5 place-items-center rounded-full border border-[#3A3833] text-[11px] text-transparent group-has-checked:border-[#C9AE78] group-has-checked:bg-[#C9AE78] group-has-checked:text-[#0B0B0C]"
  >
    ✓
  </span>
);

export default function OrderForm({ thumbs }: { thumbs: Record<Product["id"], string | null> }) {
  const [form, setForm] = useState<OrderInput>(EMPTY);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof OrderInput>(k: K, v: OrderInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setQty = (id: Product["id"], q: number) =>
    setForm((f) => {
      const items = { ...f.items };
      if (q > 0) items[id] = Math.min(q, MAX_QTY);
      else delete items[id];
      return { ...f, items };
    });
  const [preselect] = useState(() => (id: Product["id"]) => setForm((f) => (f.items[id] ? f : { ...f, items: { ...f.items, [id]: 1 } })));

  const { lines, fee, priceMissing, total } = totals(form);
  const err = (k: keyof OrderErrors) =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {};

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const res = await submitOrder(form);
        if (!res.ok) return setErrors(res.errors);
        toast.success(t.success);
        setForm(EMPTY);
      } catch {
        toast.error(t.failure);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <Suspense fallback={null}>
        <Preselect onProduct={preselect} />
      </Suspense>

      <fieldset aria-describedby={errors.products ? "products-error" : undefined}>
        <legend className={LABEL}>{t.productsLabel}</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {products.map((p) => {
            const qty = form.items[p.id];
            return (
              <div key={p.id} className="flex flex-col gap-3">
                <label className={`group ${CARD} items-center gap-4 p-3 pr-10`}>
                  <input
                    id={p.id === products[0].id ? "products" : undefined}
                    type="checkbox"
                    className="sr-only"
                    checked={!!qty}
                    onChange={(e) => setQty(p.id, e.target.checked ? 1 : 0)}
                  />
                  <span className="relative size-16 shrink-0 overflow-hidden bg-[#E2DCD2]">
                    {thumbs[p.id] && <Image src={thumbs[p.id]!} alt="" fill sizes="64px" className="object-cover" />}
                  </span>
                  <span>
                    <span className="block font-serif text-[20px] leading-tight font-light">{p.name}</span>
                    {p.price !== null && (
                      <span className="mt-1 block font-sans text-[13px] text-[#C9AE78]">{formatPrice(p.price)}</span>
                    )}
                  </span>
                  <Check />
                </label>
                {qty && (
                  <div className="flex items-center justify-between border border-[#3A3833]">
                    <button
                      type="button"
                      aria-label={`${t.decrease} (${p.name})`}
                      disabled={qty <= 1}
                      onClick={() => setQty(p.id, qty - 1)}
                      className="size-11 text-[18px] disabled:opacity-30"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="font-sans text-[15px] tabular-nums">
                      <span className="sr-only">{t.quantity} : </span>
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t.increase} (${p.name})`}
                      disabled={qty >= MAX_QTY}
                      onClick={() => setQty(p.id, qty + 1)}
                      className="size-11 text-[18px] disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.products && (
          <p id="products-error" className="mt-2 font-sans text-[13px] text-[#E08A7E]">
            {errors.products}
          </p>
        )}
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="name" label={t.fields.name} error={errors.name}>
          <input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} {...err("name")} />
        </Field>
        <Field id="phone" label={t.fields.phone} error={errors.phone}>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={t.fields.phonePlaceholder}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={INPUT}
            {...err("phone")}
          />
        </Field>
        <Field id="wilaya" label={t.fields.wilaya} error={errors.wilaya} className="sm:col-span-2">
          <select
            id="wilaya"
            value={form.wilaya}
            onChange={(e) => set("wilaya", e.target.value)}
            className={`${INPUT} [color-scheme:dark] [&>option]:bg-[#0B0B0C] [&>option]:text-[#EDE6DA] [&>option:disabled]:text-[#8F877B]`}
            {...err("wilaya")}
          >
            <option value="" disabled>
              {t.fields.wilayaPlaceholder}
            </option>
            {WILAYAS.map((w, i) => (
              <option key={w} value={w}>
                {String(i + 1).padStart(2, "0")} — {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className={LABEL}>{t.fields.delivery}</legend>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(Object.keys(t.modes) as Mode[]).map((m) => (
            <label key={m} className={`group ${CARD} flex-col gap-1 p-4 pr-10`}>
              <input type="radio" name="mode" value={m} className="sr-only" checked={form.mode === m} onChange={() => set("mode", m)} />
              <span className="font-sans text-[14px]">{t.modes[m]}</span>
              <span className="font-sans text-[13px] text-[#8F877B] tabular-nums">
                {form.wilaya ? formatPrice(shipping[form.wilaya][m]) : "—"}
              </span>
              <Check />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-[#3A3833] pt-6">
        <p className={LABEL}>{t.recap.title}</p>
        <dl className="mt-4 flex flex-col gap-3 font-sans text-[14px] text-[#BDB4A6]">
          {lines.map((l) => (
            <div key={l.id} className="flex justify-between gap-4">
              <dt>
                {l.name} × {l.qty}
              </dt>
              <dd className="tabular-nums">{l.subtotal === null ? "—" : formatPrice(l.subtotal)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt>
              {t.recap.delivery} · {t.modes[form.mode]}
              {form.wilaya && ` · ${form.wilaya}`}
            </dt>
            <dd className="text-right tabular-nums">{fee === null ? t.recap.chooseWilaya : formatPrice(fee)}</dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-[#3A3833] pt-4">
            <dt className={LABEL}>{t.recap.total}</dt>
            <dd className="font-serif text-[34px] leading-none font-light text-[#C9AE78] tabular-nums">
              {total === null ? "—" : formatPrice(total)}
            </dd>
          </div>
        </dl>
        {priceMissing && <p className="mt-3 font-sans text-[12px] text-[#8F877B]">{t.recap.priceNote}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-[58px] w-full rounded-none bg-[#EDE6DA] font-sans text-[11.5px] font-medium tracking-[.32em] text-[#0B0B0C] uppercase enabled:hover:brightness-105 motion-safe:transition-[transform,filter] motion-safe:duration-200 motion-safe:enabled:hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9AE78] disabled:opacity-60"
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
