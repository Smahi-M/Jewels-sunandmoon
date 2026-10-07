export type Photo = { src: string; alt: string; placeholder: string };

export type Product = {
  id: "collier" | "bracelet";
  name: string;
  cta: string;
  description: string;
  specs: { label: string; value: string }[];
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
    specs: [
      { label: "Matière", value: "[À confirmer]" },
      { label: "Longueur", value: "[À confirmer]" },
    ],
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
      "Au poignet, la lune argentée aux pierres bleues rencontre le soleil doré pavé de zircons. Deux breloques qui s'emboîtent, comme une promesse que l'on garde sur soi.",
    specs: [
      { label: "Matière", value: "[À confirmer]" },
      { label: "Longueur", value: "[À confirmer]" },
    ],
    photos: {
      main: {
        src: "/images/bracelet/principale.jpg",
        alt: "Bracelet Lune & Soleil : breloques lune argentée et soleil doré emboîtées",
        placeholder: "Photo du bracelet",
      },
      thumbs: [
        { src: "/images/bracelet/porte.jpg", alt: "Bracelet Lune & Soleil porté au poignet", placeholder: "Bracelet porté" },
        {
          src: "/images/bracelet/detail.jpg",
          alt: "Détail des breloques lune et soleil du bracelet",
          placeholder: "Détail du bracelet",
        },
      ],
    },
    price: null,
  },
];
