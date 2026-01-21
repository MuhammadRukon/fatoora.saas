"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCustomer } from "@/lib/server-functions";
import { CustomerForm, CustomerFormData } from "@/components/customer/form";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      vatNumber: "",
      country: "",
      vatTreatment: "not_registered",
      address: {
        buildingNumber: "",
        streetName: "",
        district: "",
        city: "",
        postalCode: "",
        additionalNumber: "",
      },
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const customerData = {
        name: data.name.trim(),
        vatNumber: data.vatNumber?.trim() || undefined,
        country: data.country || undefined,
        vatTreatment: data.vatTreatment,
        address: {
          buildingNumber: data.address.buildingNumber?.trim() || undefined,
          streetName: data.address.streetName?.trim() || undefined,
          district: data.address.district?.trim() || undefined,
          city: data.address.city?.trim() || undefined,
          postalCode: data.address.postalCode?.trim() || undefined,
          additionalNumber: data.address.additionalNumber?.trim() || undefined,
        },
      };

      const result = await createCustomer(customerData);

      if (result.success) {
        router.push("/customers");
        router.refresh();
      } else {
        setError(result.error || "Failed to create customer. Please try again.");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Customer</h1>
      </div>
      <div className=" max-w-4xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerForm form={form} isSubmitting={isSubmitting} showAddressTitle={true} />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/customers">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
