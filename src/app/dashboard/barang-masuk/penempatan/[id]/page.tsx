"use client";

import { useParams } from "next/navigation";
import { PutawayReviewView } from "@/components/dashboard/barang-masuk/putaway-review-view";

export default function PutawayReviewPage() {
  const params = useParams();
  const id = params.id as string;

  return <PutawayReviewView id={id} />;
}
