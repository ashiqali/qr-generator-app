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

export const QR_TYPE_META: Record<QrContentType, { label: string; icon: LucideIcon }> = {
  URL: { label: "Website URL", icon: Globe },
  TEXT: { label: "Plain text", icon: Type },
  EMAIL: { label: "Email", icon: Mail },
  SMS: { label: "SMS", icon: MessageSquare },
  PHONE: { label: "Phone call", icon: Phone },
  WIFI: { label: "WiFi", icon: Wifi },
  VCARD: { label: "Contact (vCard)", icon: Contact },
  APP_LINK: { label: "App store link", icon: Smartphone },
  PDF: { label: "PDF / document", icon: FileText },
};

export function QrTypeIcon({ type, className }: { type: QrContentType; className?: string }) {
  const Icon = QR_TYPE_META[type]?.icon ?? Globe;
  return <Icon className={className} />;
}
