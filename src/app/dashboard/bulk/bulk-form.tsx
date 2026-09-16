"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseBulkCsv, type BulkCsvRow } from "@/lib/csv";
import { bulkGenerateAction } from "./actions";

export function BulkForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkCsvRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: { id: string; name: string }[]; skipped: { name: string; reason: string }[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);

    const text = await file.text();
    const parsed = parseBulkCsv(text);
    if (parsed.length === 0) {
      setError("No valid rows found. Expect two columns: name, url.");
    }
    setRows(parsed);
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await bulkGenerateAction(rows);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res);
      toast.success(`Created ${res.created.length} QR code${res.created.length === 1 ? "" : "s"}`);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFile}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 size-4" /> {fileName ?? "Choose CSV file"}
            </Button>
            <p className="text-xs text-muted-foreground">
              CSV with two columns: <code>name,url</code>. All rows become dynamic (trackable) URL QR
              codes.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {rows.length > 0 && !result && (
            <>
              <div className="max-h-64 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 100).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="truncate max-w-xs">{row.url}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground">{rows.length} rows ready to generate.</p>
              <Button type="button" onClick={handleGenerate} disabled={isPending}>
                {isPending ? "Generating..." : `Generate ${rows.length} QR codes`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm">
              Created <span className="font-medium">{result.created.length}</span> QR codes.
              {result.skipped.length > 0 && (
                <>
                  {" "}
                  Skipped <span className="font-medium">{result.skipped.length}</span>.
                </>
              )}
            </p>
            {result.created.length > 0 && (
              <Button
                render={<a href={`/api/qr/bulk-zip?ids=${result.created.map((c) => c.id).join(",")}`} download />}
              >
                <Download className="mr-2 size-4" /> Download all as ZIP
              </Button>
            )}
            {result.skipped.length > 0 && (
              <div className="space-y-1 text-sm text-muted-foreground">
                {result.skipped.map((s, i) => (
                  <p key={i}>
                    {s.name}: {s.reason}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
