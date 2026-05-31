import localFont from "next/font/local";

export const poppinsExtraBold = localFont({
  src: "../../fontes/Poppins-ExtraBold/Poppins-ExtraBold.ttf",
  variable: "--font-display",
  weight: "800",
  display: "swap",
});

export const poppinsBold = localFont({
  src: "../../fontes/Poppins-Bold/Poppins-Bold.ttf",
  variable: "--font-heading",
  weight: "700",
  display: "swap",
});

export const poppinsSemiBold = localFont({
  src: "../../fontes/Poppins-SemiBold/Poppins-SemiBold.ttf",
  variable: "--font-body",
  weight: "600",
  display: "swap",
});
