"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm, CustomerFormData } from "@/components/customer/form";
import { getCustomer, updateCustomer } from "@/lib/server-functions";

export function CustomerViewUpdateModal({
  open,
  setOpen,
  customerId,
  onCustomerUpdated,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  customerId?: string;
  onCustomerUpdated?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
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

  const canLoad = useMemo(() => open && !!customerId, [open, customerId]);

  useEffect(() => {
    if (!canLoad) return;

    let cancelled = false;
    async function loadCustomer() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getCustomer(customerId!);

        if (cancelled) return;

        if (result.success && result.customer) {
          const c = result.customer as any;
          form.reset({
            name: c?.name || "",
            vatNumber: c?.vatNumber || "",
            country: c?.country || "",
            branch: c?.branch || "",
            vatTreatment: c?.vatTreatment || "not_registered",
            address: {
              buildingNumber: c?.address?.buildingNumber || "",
              streetName: c?.address?.streetName || "",
              district: c?.address?.district || "",
              city: c?.address?.city || "",
              postalCode: c?.address?.postalCode || "",
              additionalNumber: c?.address?.additionalNumber || "",
            },
          });
        } else {
          setError(result.error || "Failed to load customer");
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load customer");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCustomer();
    return () => {
      cancelled = true;
    };
  }, [canLoad, customerId, form]);

  const handleClose = () => {
    if (!isSubmitting) {
      setError("");
      setOpen(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!customerId) return;
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
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

      const result = await updateCustomer(customerId, payload);

      if (result.success) {
        setOpen(false);
        onCustomerUpdated?.();
      } else {
        setError(result.error || "Failed to update customer");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>View / Update Customer</DialogTitle>
            <DialogDescription>
              Edit customer information, then click save.
            </DialogDescription>
          </DialogHeader>

          {error && <div className="text-sm text-red-600 px-6 pt-4">{error}</div>}

          <CustomerForm
            form={form}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            addressLayout="grid"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading || !customerId}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
