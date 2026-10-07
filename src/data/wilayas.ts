// Delivery fees in DA, per wilaya. Reused from scrollaroids-demo.
// Placeholder values: replace with the delivery company's rates.
const ALGER = { domicile: 400, bureau: 300 };
const NORD = { domicile: 600, bureau: 400 };
const SUD = { domicile: 900, bureau: 600 };

export type Mode = "domicile" | "bureau";

// ponytail: 58 wilayas for the demo (69 since Nov 2025, numbering not settled).
// For real clients, mirror their delivery company's list (Yalidine, ZR...): they decide where they ship.
// Key order = wilaya number.
export const shipping: Record<string, Record<Mode, number>> = {
  Adrar: SUD, Chlef: NORD, Laghouat: SUD, "Oum El Bouaghi": NORD, Batna: NORD, Béjaïa: NORD,
  Biskra: SUD, Béchar: SUD, Blida: NORD, Bouira: NORD, Tamanrasset: SUD, Tébessa: NORD,
  Tlemcen: NORD, Tiaret: NORD, "Tizi Ouzou": NORD, Alger: ALGER, Djelfa: NORD, Jijel: NORD,
  Sétif: NORD, Saïda: NORD, Skikda: NORD, "Sidi Bel Abbès": NORD, Annaba: NORD, Guelma: NORD,
  Constantine: NORD, Médéa: NORD, Mostaganem: NORD, "M'Sila": NORD, Mascara: NORD, Ouargla: SUD,
  Oran: NORD, "El Bayadh": SUD, Illizi: SUD, "Bordj Bou Arréridj": NORD, Boumerdès: NORD,
  "El Tarf": NORD, Tindouf: SUD, Tissemsilt: NORD, "El Oued": SUD, Khenchela: NORD,
  "Souk Ahras": NORD, Tipaza: NORD, Mila: NORD, "Aïn Defla": NORD, Naâma: SUD,
  "Aïn Témouchent": NORD, Ghardaïa: SUD, Relizane: NORD, Timimoun: SUD, "Bordj Badji Mokhtar": SUD,
  "Ouled Djellal": SUD, "Béni Abbès": SUD, "In Salah": SUD, "In Guezzam": SUD, Touggourt: SUD,
  Djanet: SUD, "El M'Ghair": SUD, "El Meniaa": SUD,
};
