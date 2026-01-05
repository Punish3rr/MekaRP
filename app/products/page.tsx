import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProductsPage() {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button>New Product</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Technical Note</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.technical_note || "-"}</td>
                <td className="p-4 text-right">
                  <Link href={`/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
