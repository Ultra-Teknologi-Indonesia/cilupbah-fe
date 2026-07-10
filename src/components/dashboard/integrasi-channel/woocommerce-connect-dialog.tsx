"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnectWooCommerce } from "@/hooks/channel/use-channel-actions";

const storeUrlField = z
  .string()
  .min(1, "Store URL wajib diisi")
  .url("Store URL tidak valid");

const autoSchema = z.object({
  storeUrl: storeUrlField,
});

const manualSchema = z.object({
  storeUrl: storeUrlField,
  consumerKey: z.string().min(1, "Consumer Key wajib diisi"),
  consumerSecret: z.string().min(1, "Consumer Secret wajib diisi"),
});

type AutoValues = z.infer<typeof autoSchema>;
type ManualValues = z.infer<typeof manualSchema>;

export function WooCommerceConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { auto, manual } = useConnectWooCommerce();

  const autoForm = useForm<AutoValues>({
    resolver: zodResolver(autoSchema),
    defaultValues: { storeUrl: "" },
  });

  const manualForm = useForm<ManualValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { storeUrl: "", consumerKey: "", consumerSecret: "" },
  });

  React.useEffect(() => {
    if (!open) {
      autoForm.reset();
      manualForm.reset();
    }
  }, [open, autoForm, manualForm]);

  const onAuto = autoForm.handleSubmit((values) => {
    auto.mutate(values.storeUrl);
  });

  const onManual = manualForm.handleSubmit((values) => {
    manual.mutate(
      {
        storeUrl: values.storeUrl,
        consumerKey: values.consumerKey,
        consumerSecret: values.consumerSecret,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hubungkan WooCommerce</DialogTitle>
          <DialogDescription>
            Masukkan alamat toko WooCommerce untuk mulai sinkronisasi produk,
            stok, dan pesanan.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="auto">
          <TabsList className="w-full">
            <TabsTrigger value="auto" className="flex-1">
              Hubungkan otomatis
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">
              Masukkan kunci manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="mt-4">
            <Form {...autoForm}>
              <form onSubmit={onAuto} className="space-y-4">
                <FormField
                  control={autoForm.control}
                  name="storeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://toko.example.com"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={auto.isPending}
                  >
                    {auto.isPending ? (
                      <Loader2Icon className="animate-spin motion-reduce:animate-none" />
                    ) : null}
                    Lanjutkan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <Form {...manualForm}>
              <form onSubmit={onManual} className="space-y-4">
                <FormField
                  control={manualForm.control}
                  name="storeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://toko.example.com"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="consumerKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumer Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ck_..."
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualForm.control}
                  name="consumerSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consumer Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="cs_..."
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={manual.isPending}
                  >
                    {manual.isPending ? (
                      <Loader2Icon className="animate-spin motion-reduce:animate-none" />
                    ) : null}
                    Hubungkan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
