import { order, products, type Product } from "./content";
import { shipping, type Mode } from "./data/wilayas";

export type OrderInput = {
  items: Partial<Record<Product["id"], number>>;
  name: string;
  phone: string;
  wilaya: string;
  mode: Mode;
};

export type OrderErrors = Partial<Record<keyof typeof order.errors, string>>;

export const MAX_QTY = 10;
const PHONE = /^0[567]\d{8}$/;
const isQty = (q: unknown): q is number => Number.isInteger(q) && (q as number) >= 1 && (q as number) <= MAX_QTY;

// Shared by the form (instant feedback) and the Server Action (trust boundary): input may be anything.
export function validate(o: OrderInput): OrderErrors {
  const e: OrderErrors = {};
  const items = Object.entries(o.items ?? {});
  if (!items.length || items.some(([id, q]) => !products.some((p) => p.id === id) || !isQty(q)))
    e.products = order.errors.products;
  if (typeof o.name !== "string" || o.name.trim().length < 2) e.name = order.errors.name;
  if (typeof o.phone !== "string" || !PHONE.test(o.phone.replace(/\s/g, ""))) e.phone = order.errors.phone;
  if (typeof o.wilaya !== "string" || !Object.hasOwn(shipping, o.wilaya)) e.wilaya = order.errors.wilaya;
  if (o.mode !== "domicile" && o.mode !== "bureau") e.mode = order.errors.mode;
  return e;
}

// Prices come from content.ts, never from the client. A null price anywhere => total unknown.
export function totals(o: Pick<OrderInput, "items" | "wilaya" | "mode">) {
  const lines = products
    .filter((p) => o.items[p.id])
    .map((p) => {
      const qty = o.items[p.id]!;
      return { id: p.id, name: p.name, qty, subtotal: p.price === null ? null : p.price * qty };
    });
  const fee = Object.hasOwn(shipping, o.wilaya) ? shipping[o.wilaya][o.mode] : null;
  const priceMissing = lines.some((l) => l.subtotal === null);
  const total =
    lines.length && !priceMissing && fee !== null ? lines.reduce((s, l) => s + l.subtotal!, 0) + fee : null;
  return { lines, fee, priceMissing, total };
}
