import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";

const codeBlockClass =
  "overflow-x-auto rounded-lg border bg-muted p-4 text-sm leading-relaxed [&_code]:font-mono";

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-semibold">REST API</h1>
          <p className="mt-2 text-muted-foreground">
            Programmatic access to create and manage QR codes. Requires a Business plan API key,
            created from{" "}
            <a href="/dashboard/api-keys" className="text-primary underline underline-offset-4">
              Dashboard &rarr; API Keys
            </a>
            .
          </p>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-lg font-medium">Authentication</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pass your API key as a bearer token on every request.
              </p>
              <pre className={`${codeBlockClass} mt-3`}>
                <code>Authorization: Bearer qr_live_xxxxxxxxxxxxxxxxxxxxxxxx</code>
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-medium">List QR codes</h2>
              <pre className={`${codeBlockClass} mt-3`}>
                <code>{`GET /api/v1/qr-codes`}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-medium">Create a QR code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                All API-created codes are dynamic. <code>design</code> is optional and merges with
                sensible defaults.
              </p>
              <pre className={`${codeBlockClass} mt-3`}>
                <code>{`POST /api/v1/qr-codes
Content-Type: application/json

{
  "name": "Storefront menu",
  "payload": { "type": "URL", "url": "https://example.com/menu" }
}`}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-medium">Get / update / delete a QR code</h2>
              <pre className={`${codeBlockClass} mt-3`}>
                <code>{`GET    /api/v1/qr-codes/:id
PATCH  /api/v1/qr-codes/:id   { "name"?, "payload"? }
DELETE /api/v1/qr-codes/:id`}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-medium">Content payload types</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <code>payload.type</code> is one of: <code>URL</code>, <code>TEXT</code>,{" "}
                <code>EMAIL</code>, <code>SMS</code>, <code>PHONE</code>, <code>WIFI</code>,{" "}
                <code>VCARD</code>, <code>APP_LINK</code>, <code>PDF</code> — each with its own
                fields, matching the create form in the dashboard.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium">Rate limits</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                API usage is metered per billing period as part of your plan. Responses use standard
                HTTP status codes — 401 for missing/invalid keys, 403 for plan restrictions, 404 for
                unknown IDs.
              </p>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
