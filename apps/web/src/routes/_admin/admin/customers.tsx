import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6">Customers</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No customers yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
