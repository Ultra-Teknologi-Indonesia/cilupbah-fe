import {
  FormSkeleton,
  PageHeaderSkeleton,
  TabBarSkeleton,
} from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <TabBarSkeleton />
      <FormSkeleton />
    </div>
  );
}
