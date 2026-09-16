import { z } from "zod";

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_LOGO_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

export const qrDesignSchema = z.object({
  fgColor: z.string().regex(HEX_COLOR_RE, "Must be a hex color"),
  bgColor: z.string().regex(HEX_COLOR_RE, "Must be a hex color"),
  dotStyle: z.enum(["square", "rounded", "dots"]),
  cornerStyle: z.enum(["square", "rounded", "extra-rounded"]),
  logoDataUrl: z
    .string()
    .regex(SAFE_LOGO_DATA_URL_RE, "Logo must be a PNG/JPEG/WEBP/GIF image")
    .optional()
    .or(z.literal("")),
  errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]),
  frameText: z.string().max(40).optional().or(z.literal("")),
});

const urlField = z.string().trim().min(1, "Required").url("Enter a valid URL");
const optionalUrlField = z.string().trim().url("Enter a valid URL").optional().or(z.literal(""));
const emailField = z.string().trim().email("Enter a valid email");

export const qrContentPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("URL"), url: urlField }),
  z.object({ type: z.literal("TEXT"), text: z.string().trim().min(1, "Required").max(2000) }),
  z.object({
    type: z.literal("EMAIL"),
    to: emailField,
    subject: z.string().max(200).optional().or(z.literal("")),
    body: z.string().max(2000).optional().or(z.literal("")),
  }),
  z.object({
    type: z.literal("SMS"),
    phone: z.string().trim().min(3, "Required").max(20),
    message: z.string().max(500).optional().or(z.literal("")),
  }),
  z.object({ type: z.literal("PHONE"), phone: z.string().trim().min(3, "Required").max(20) }),
  z.object({
    type: z.literal("WIFI"),
    ssid: z.string().trim().min(1, "Required").max(100),
    password: z.string().max(100).optional().or(z.literal("")),
    encryption: z.enum(["WPA", "WEP", "nopass"]),
    hidden: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("VCARD"),
    firstName: z.string().trim().min(1, "Required").max(100),
    lastName: z.string().max(100).optional().or(z.literal("")),
    org: z.string().max(150).optional().or(z.literal("")),
    title: z.string().max(150).optional().or(z.literal("")),
    phone: z.string().max(30).optional().or(z.literal("")),
    email: emailField.optional().or(z.literal("")),
    website: optionalUrlField,
    address: z.string().max(300).optional().or(z.literal("")),
  }),
  z.object({
    type: z.literal("APP_LINK"),
    iosUrl: optionalUrlField,
    androidUrl: optionalUrlField,
    fallbackUrl: urlField,
  }),
  z.object({
    type: z.literal("PDF"),
    fileUrl: urlField,
    title: z.string().max(150).optional().or(z.literal("")),
  }),
]);

export const qrContentTypes = qrContentPayloadSchema.options.map((o) => o.shape.type.value);

export const upsertQrSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  isDynamic: z.boolean(),
  design: qrDesignSchema,
  payload: qrContentPayloadSchema,
});

export type UpsertQrInput = z.infer<typeof upsertQrSchema>;
