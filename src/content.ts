export type Photo = { src: string; alt: string; placeholder: string };

export type Product = {
  id: "collier" | "bracelet";
  name: string;
  cta: string;
  description: string;
  photos: { main: Photo; thumbs: [Photo, Photo] };
  /** Prix en DA. null = aucun prix affiché nulle part. */
  price: number | null;
};

export const formatPrice = (price: number) => `${new Intl.NumberFormat("fr-FR").format(price)} DA`;

export const collection = {
  eyebrow: "La collection",
  title: { before: "La Lune", amp: "&", after: "le Soleil" },
};

export const products: Product[] = [
  {
    id: "collier",
    name: "Collier Lune & Soleil",
    cta: "Commander le collier",
    description:
      "Une lune argentée sertie de pierres bleues, un soleil doré pavé de zircons : deux pendentifs qui s'emboîtent pour n'en former qu'un. Portés ensemble ou séparément, ils accompagnent chaque lumière du jour.",
    photos: {
      main: {
        src: "/images/collier/principale.jpg",
        alt: "Collier Lune & Soleil : le pendentif soleil doré et le pendentif lune argentée aux pierres bleues, emboîtés côte à côte sur leurs chaînes dorée et argentée",
        placeholder: "Photo du collier",
      },
      thumbs: [
        {
          src: "/images/collier/porte.jpg",
          alt: "Le pendentif soleil doré pavé de zircons, seul sur sa chaîne dorée",
          placeholder: "Pendentif soleil",
        },
        {
          src: "/images/collier/detail.jpg",
          alt: "Le pendentif lune argentée sertie de pierres bleues et de zircons, seul sur sa chaîne argentée",
          placeholder: "Pendentif lune",
        },
      ],
    },
    price: 4900,
  },
  {
    id: "bracelet",
    name: "Bracelet Lune & Soleil",
    cta: "Commander le bracelet",
    description:
      "Au poignet, la lune argentée aux pierres bleues rencontre le soleil doré pavé de zircons. Deux pièces qui s'emboîtent, comme une promesse que l'on garde sur soi.",
    photos: {
      main: {
        src: "/images/bracelet/principale.jpg",
        alt: "Bracelet Lune & Soleil : une chaîne argentée et une chaîne dorée, réunies par la lune aux pierres bleues et le soleil pavé de zircons emboîtés",
        placeholder: "Photo du bracelet",
      },
      thumbs: [
        {
          src: "/images/bracelet/porte.jpg",
          alt: "Le bracelet Lune & Soleil porté au poignet, sous une manche en maille crème",
          placeholder: "Bracelet porté",
        },
        {
          src: "/images/bracelet/detail.jpg",
          alt: "Gros plan sur la lune aux pierres bleues et le soleil doré pavé de zircons du bracelet",
          placeholder: "Détail du bracelet",
        },
      ],
    },
    price: 3900,
  },
];

export const order = {
  eyebrow: "Commande",
  title: { before: "Réserver", em: "votre pièce" },
  intro: "Paiement à la livraison, à domicile ou en stop desk, dans 58 wilayas.",
  productsLabel: "Vos pièces",
  decrease: "Retirer une pièce",
  increase: "Ajouter une pièce",
  quantity: "Quantité",
  fields: {
    name: "Nom complet",
    phone: "Téléphone",
    phonePlaceholder: "05 00 00 00 00",
    wilaya: "Wilaya",
    wilayaPlaceholder: "Choisir la wilaya",
    delivery: "Livraison",
  },
  modes: { domicile: "À domicile", bureau: "Stop desk" },
  recap: {
    title: "Récapitulatif",
    delivery: "Livraison",
    chooseWilaya: "Choisissez votre wilaya",
    total: "Total",
    priceNote: "Le prix vous sera confirmé par téléphone.",
  },
  submit: "Confirmer la commande",
  sending: "Envoi en cours…",
  success: "Commande reçue — nous vous appelons pour confirmer.",
  failure: "La commande n'a pas pu être envoyée. Réessayez dans un instant.",
  errors: {
    products: "Choisissez au moins une pièce.",
    name: "Indiquez votre nom complet.",
    phone: "Numéro invalide : 05, 06 ou 07 suivi de 8 chiffres.",
    wilaya: "Choisissez votre wilaya.",
    mode: "Choisissez un mode de livraison.",
  },
};

export const floatingCta = "Commander";

export const footer = { brand: "Orléa", note: "Paiement à la livraison · 58 wilayas · © 2026" };
