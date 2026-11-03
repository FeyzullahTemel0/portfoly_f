import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTelegram, FaThreads, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { SocialKey } from "@/lib/site";

export const socialIcons: Partial<Record<SocialKey, IconType>> = {
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  instagram: FaInstagram,
  threads: FaThreads,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  tiktok: FaTiktok,
};

export const socialColors: Partial<Record<SocialKey, string>> = {
  whatsapp: "#25D366",
  telegram: "#27A7E7",
  instagram: "#E1306C",
  threads: "#9aa4b2",
  x: "#9aa4b2",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
  youtube: "#FF0033",
  tiktok: "#25F4EE",
};
