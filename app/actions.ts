"use server";

import { totals, validate, type OrderErrors, type OrderInput } from "@/src/order";

export async function submitOrder(input: OrderInput): Promise<{ ok: true } | { ok: false; errors: OrderErrors }> {
  const errors = validate(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { lines, fee, total } = totals(input);
  const record = {
    date: new Date().toISOString(),
    produits: lines.map(({ name, qty, subtotal }) => ({ name, qty, subtotal })),
    client: { nom: input.name.trim(), telephone: input.phone.replace(/\s/g, "") },
    wilaya: input.wilaya,
    livraison: { mode: input.mode, frais: fee },
    total, // null tant qu'un prix manque dans content.ts
  };
  // TODO: brancher Google Sheets (append de `record` via l'API Sheets ou un webhook Apps Script).
  console.log("[commande]", JSON.stringify(record));
  return { ok: true };
}
