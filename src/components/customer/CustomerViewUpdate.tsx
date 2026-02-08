"use client";

import { Customer } from "@payload-types";
import React, { useState } from "react";
import { CustomerForm, CustomerFormData } from "./form";
import { useForm } from "react-hook-form";
import { updateCustomer } from "@/lib/server-functions";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";

export function CustomerViewUpdate({ customer }: { customer: Customer }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomerFormData>({
    defaultValues: {
      name: customer.name || "",
      vatNumber: customer.vatNumber || "",
      country: customer.country || "",
      vatTreatment: customer.vatTreatment,
      branch: customer.branch || "",
      address: {
        buildingNumber: customer.address?.buildingNumber || "",
        streetName: customer.address?.streetName || "",
        district: customer.address?.district || "",
        city: customer.address?.city || "",
        postalCode: customer.address?.postalCode || "",
        additionalNumber: customer.address?.additionalNumber || "",
      },
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    if (!customer.id) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name.trim(),
        vatNumber: data.vatNumber?.trim() || "",
        country: data.country || undefined,
        vatTreatment: data.vatTreatment,
        branch: data.branch || "",
        address: {
          buildingNumber: data.address.buildingNumber?.trim() || "",
          streetName: data.address.streetName?.trim() || "",
          district: data.address.district?.trim() || "",
          city: data.address.city?.trim() || "",
          postalCode: data.address.postalCode?.trim() || "",
          additionalNumber: data.address.additionalNumber?.trim() || "",
        },
      };

      console.log(payload);

      const result = await updateCustomer(customer.id, payload);

      if (result.success) {
        //DO something
        console.log("result success", result);
      } else {
        console.error("failure", result);
      }
    } catch (e: any) {
      console.error("error", e);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" asChild>
          <Link href="/customers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
      </div>
      <Card className="p-6 md:p-8">
        <div className="space-y-6">
          <CustomerForm form={form} isSubmitting={isSubmitting} showAddressTitle={true} />
        </div>
      </Card>
      <Button
        className="flex ml-auto cursor-pointer active:scale-95 transition-all duration-200"
        type="submit"
        disabled={isSubmitting || !customer.id}
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
