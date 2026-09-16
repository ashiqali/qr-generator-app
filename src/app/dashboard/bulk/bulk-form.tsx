"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="font-heading text-base font-bold">Import CSV Spreadsheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/90 bg-muted/20 p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFile}
            />
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 transition-transform group-hover:scale-105">
              <Upload className="size-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {fileName ?? "Click to select or drop a CSV file"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Required format: 2 columns header <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">name, url</code>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {rows.length > 0 && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Parsed Records Preview ({rows.length} rows ready)
                </span>
                <span className="text-xs text-muted-foreground">Showing first 100</span>
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-border/80 bg-background">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border/80">
                      <TableHead className="text-xs font-semibold uppercase">#</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">QR Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Destination URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 100).map((row, i) => (
                      <TableRow key={i} className="border-b border-border/60">
                        <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                        <TableCell className="font-medium text-xs">{row.name}</TableCell>
                        <TableCell className="truncate max-w-xs font-mono text-xs text-muted-foreground">{row.url}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isPending}
                size="lg"
                className="h-10 rounded-xl px-6 shadow-md shadow-primary/20 text-xs font-semibold"
              >
                {isPending ? "Generating Campaign Batch..." : `Generate ${rows.length} QR Codes`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Result Card */}
      {result && (
        <Card className="card-sheen elevated-card rounded-2xl border border-border/80 shadow-xs">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-foreground">Batch Generation Complete</h4>
                <p className="text-xs text-muted-foreground">
                  Created <span className="font-semibold text-foreground">{result.created.length}</span> QR codes.
                  {result.skipped.length > 0 && (
                    <span> Skipped {result.skipped.length} duplicate/invalid entries.</span>
                  )}
                </p>
              </div>
            </div>

            {result.created.length > 0 && (
              <Button
                render={<a href={`/api/qr/bulk-zip?ids=${result.created.map((c) => c.id).join(",")}`} download />}
                size="lg"
                className="h-10 rounded-xl px-6 shadow-md shadow-primary/20 text-xs font-semibold"
              >
                <Download className="mr-2 size-4" /> Download All as ZIP Archive
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
