import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Pinyon_Script } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Orléa Jewels — Collection Lune & Soleil",
  description: "Orléa Jewels, collection Lune & Soleil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${manrope.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#151311",
              border: "1px solid #3A3833",
              color: "#EDE6DA",
              borderRadius: 0,
              fontFamily: "var(--font-manrope)",
            },
          }}
        />
      </body>
    </html>
  );
}
