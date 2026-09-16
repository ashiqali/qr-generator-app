import {
  Globe,
  Type,
  Mail,
  MessageSquare,
  Phone,
  Wifi,
  Contact,
  Smartphone,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { QrContentType } from "@/lib/qr/types";

export const QR_TYPE_META: Record<QrContentType, { label: string; description: string; icon: LucideIcon }> = {
  URL: { label: "Website URL", description: "Link to any web page", icon: Globe },
  TEXT: { label: "Plain text", description: "Show a block of text", icon: Type },
  EMAIL: { label: "Email", description: "Pre-filled email draft", icon: Mail },
  SMS: { label: "SMS", description: "Pre-filled text message", icon: MessageSquare },
  PHONE: { label: "Phone call", description: "One-tap dial a number", icon: Phone },
  WIFI: { label: "WiFi", description: "Join a wireless network", icon: Wifi },
  VCARD: { label: "Contact (vCard)", description: "Save a contact card", icon: Contact },
  APP_LINK: { label: "App store link", description: "Send to iOS or Android store", icon: Smartphone },
  PDF: { label: "PDF / document", description: "Open a hosted file", icon: FileText },
};

export function QrTypeIcon({ type, className }: { type: QrContentType; className?: string }) {
  const Icon = QR_TYPE_META[type]?.icon ?? Globe;
  return <Icon className={className} />;
}
