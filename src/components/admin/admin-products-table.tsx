"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bulkDeleteProductsAction } from "@/app/admin/products/actions";
import { Currency, formatPrice } from "@/types/currency";
import { formatCategoryLabel, type ProductCategory } from "@/types/product";

export function AdminProductsTable({ products }: { products: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

 // Modal durumları
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [singleProductToDelete, setSingleProductToDelete] = useState<any | null>(null);

  // Tümünü Seç (Select All)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));  // Tablodaki tüm ürünlerin ID'lerini bir diziye aktarır
    } else {
      setSelectedIds([]); // Seçimleri temizler
    }
  };


  // Tekil Seçim (Select Row)
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);  // Mevcut diziye yeni ID'yi ekler
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));  // Seçimi kaldırılan ID'yi diziden filtreler
    }
  };

// Toplu Silme İşlemi
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);   // Butonu pasife alır
    await bulkDeleteProductsAction(selectedIds);  // Server Action çağrısı
    setSelectedIds([]);   // Seçimleri sıfırlar
    setIsDeleting(false);  // Butonu tekrar aktif eder
    setIsBulkDeleteDialogOpen(false);
  };

  // Tekil Silme İşlemi (Aynı Server Action ile)
  const handleConfirmSingleDelete = async () => {
    if (!singleProductToDelete) return;

    setIsDeleting(true);
    await bulkDeleteProductsAction([singleProductToDelete.id]);
    setSingleProductToDelete(null);
    setIsDeleting(false);
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No products yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first product to see it listed here.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/products/new">Create product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ürün seçildiğinde çıkan Toplu Silme Barı */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length} item(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsBulkDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* 🌟 DÜZELTME: MOBİLDE TAŞMAYAN YATAY KAYDIRILABİLİR TABLO */}
      <div className="rounded-xl border border-border overflow-x-auto custom-scrollbar">
        <Table className="w-full min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-14">Image</TableHead>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[15%]">Category</TableHead>
              <TableHead className="w-[15%]">Price</TableHead>
              <TableHead className="w-[10%]">Stock</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectOne(product.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted shrink-0">
                    {product.imageUrls?.[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell
                  className="max-w-[180px] truncate font-medium"
                  title={product.name}
                >
                  {product.name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatCategoryLabel(product.category as ProductCategory)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatPrice(product.priceCents, product.currency as Currency)}
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1.5">
                    <Button asChild variant="outline" size="sm" className="h-8 px-2.5">
                      <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2.5"
                      onClick={() => setSingleProductToDelete(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Toplu Silme Onay Modalı */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{selectedIds.length}</strong> selected product(s) from MongoDB, Stripe, and Vercel Blob storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Products"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. TEKİL SİLME MODALI */}
      <AlertDialog
        open={!!singleProductToDelete}
        onOpenChange={(open) => !open && setSingleProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{singleProductToDelete?.name}</strong>? This action will permanently remove it from MongoDB, Stripe, and Vercel Blob storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}