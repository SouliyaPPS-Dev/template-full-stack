import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_user/cart")({
  component: CartPage,
});

function CartPage() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 md:mb-8">Shopping Cart</h2>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
          <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-base md:text-lg mb-4">Your cart is empty</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
