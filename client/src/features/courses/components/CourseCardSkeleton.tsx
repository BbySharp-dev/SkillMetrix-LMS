import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden border-gray-100">
            <Skeleton className="h-44 w-full rounded-none" />
            <CardContent className="p-4 space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3 mt-2" />
                <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
        </Card>
    );
}
