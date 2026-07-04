"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useContactCategories,
  useCreateContact,
} from "@/hooks/kontak-pemasok/use-contacts";
import type { ContactItem } from "@/types/kontak-pemasok/contact";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (contact: ContactItem) => void;
  defaultName?: string;
}

export function TambahPelangganDialog({
  open,
  onOpenChange,
  onCreated,
  defaultName,
}: Props) {
  const [name, setName] = useState(defaultName ?? "");
  const [phone, setPhone] = useState("");
  const [taxType, setTaxType] = useState<"PKP" | "NON_PKP">("NON_PKP");
  const [address, setAddress] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const { data: categories } = useContactCategories();
  const createMut = useCreateContact();

  const defaultCategoryId =
    categoryId ||
    categories?.find((c) => c.code === "PLG-UMUM")?.id ||
    categories?.[0]?.id ||
    "";

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    const contact = await createMut.mutateAsync({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      type: "CUSTOMER",
      tax_type: taxType,
      category_id: defaultCategoryId || null,
    } as never);
    onCreated(contact);
    onOpenChange(false);
    setName("");
    setPhone("");
    setAddress("");
    setCategoryId("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Nama"
              autoFocus
            />
          </div>

          <div>
            <Label>Kategori</Label>
            <select
              value={defaultCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 flex h-10 w-full items-center rounded-full border border-border bg-background px-3 text-sm"
            >
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>
              No. Telepon <span className="text-destructive">*</span>
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Masukkan No. Telepon"
              inputMode="tel"
            />
          </div>

          <div>
            <Label>
              Alamat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan Alamat"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div>
            <Label>Tipe Pajak</Label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as "PKP" | "NON_PKP")}
              className="mt-1 flex h-10 w-full items-center rounded-full border border-border bg-background px-3 text-sm"
            >
              <option value="NON_PKP">Non PKP</option>
              <option value="PKP">PKP</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !name.trim() ||
              !phone.trim() ||
              !address.trim() ||
              createMut.isPending
            }
          >
            {createMut.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
