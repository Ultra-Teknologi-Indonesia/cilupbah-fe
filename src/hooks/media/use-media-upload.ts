"use client";

import { useMutation } from "@tanstack/react-query";

import { MediaService } from "@/services/master-produk/media.service";

export function useMediaUpload() {
  return useMutation({
    mutationFn: (file: File) => MediaService.upload(file),
  });
}
