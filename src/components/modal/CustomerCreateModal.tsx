"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCustomer } from "@/lib/server-functions";
import { CustomerForm, CustomerFormData } from "@/components/customer/form";

export function CustomerCreateModal({
  open,
  setOpen,
  onCustomerCreated,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCustomerCreated?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      vatNumber: "",
      country: "",
      branch: "",
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
        branch: data.branch || undefined,
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
        form.reset();
        setOpen(false);
        if (onCustomerCreated) {
          onCustomerCreated();
        }
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

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setError("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your list. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm form={form} isSubmitting={isSubmitting} />
          {error && <p className="text-sm text-red-500 px-6 pb-4">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
