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
        alt: "Collier Lune & Soleil : pendentif lune argentée et pendentif soleil doré emboîtés",
        placeholder: "Photo du collier",
      },
      thumbs: [
        { src: "/images/collier/porte.jpg", alt: "Collier Lune & Soleil porté", placeholder: "Collier porté" },
        {
          src: "/images/collier/detail.jpg",
          alt: "Détail des pierres bleues de la lune et du pavé de zircons du soleil",
          placeholder: "Détail du collier",
        },
      ],
    },
    price: null,
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
        alt: "Bracelet Lune & Soleil : pièces lune argentée et soleil doré emboîtées",
        placeholder: "Photo du bracelet",
      },
      thumbs: [
        { src: "/images/bracelet/porte.jpg", alt: "Bracelet Lune & Soleil porté au poignet", placeholder: "Bracelet porté" },
        {
          src: "/images/bracelet/detail.jpg",
          alt: "Détail des pièces lune et soleil du bracelet",
          placeholder: "Détail du bracelet",
        },
      ],
    },
    price: null,
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
