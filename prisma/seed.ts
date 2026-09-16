import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_DESIGN } from "../src/lib/qr/types";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@qrforge.dev" },
    update: {},
    create: {
      email: "demo@qrforge.dev",
      name: "Demo User",
      hashedPassword,
      plan: "PRO",
    },
  });

  await prisma.qrCode.upsert({
    where: { shortCode: "demo0001" },
    update: {},
    create: {
      ownerId: user.id,
      name: "Company website",
      type: "URL",
      isDynamic: true,
      shortCode: "demo0001",
      targetPayload: JSON.stringify({ type: "URL", url: "https://example.com" }),
      design: JSON.stringify(DEFAULT_DESIGN),
    },
  });

  const wifiQr = await prisma.qrCode.findFirst({ where: { ownerId: user.id, name: "Office WiFi" } });
  if (!wifiQr) {
    await prisma.qrCode.create({
      data: {
        ownerId: user.id,
        name: "Office WiFi",
        type: "WIFI",
        isDynamic: false,
        targetPayload: JSON.stringify({
          type: "WIFI",
          ssid: "QRForge-Guest",
          password: "welcome123",
          encryption: "WPA",
          hidden: false,
        }),
        design: JSON.stringify(DEFAULT_DESIGN),
      },
    });
  }

  const vcardQr = await prisma.qrCode.findFirst({ where: { ownerId: user.id, name: "Business card" } });
  if (!vcardQr) {
    await prisma.qrCode.create({
      data: {
        ownerId: user.id,
        name: "Business card",
        type: "VCARD",
        isDynamic: false,
        targetPayload: JSON.stringify({
          type: "VCARD",
          firstName: "Demo",
          lastName: "User",
          org: "QRForge",
          email: "demo@qrforge.dev",
        }),
        design: JSON.stringify(DEFAULT_DESIGN),
      },
    });
  }

  console.log("Seeded demo user: demo@qrforge.dev / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
