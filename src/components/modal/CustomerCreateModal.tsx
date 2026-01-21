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
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combo-box";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createCustomer } from "@/lib/server-functions";

const ARAB_COUNTRIES = [
  { label: "Saudi Arabia", value: "SA" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "Kuwait", value: "KW" },
  { label: "Qatar", value: "QA" },
  { label: "Bahrain", value: "BH" },
  { label: "Oman", value: "OM" },
  { label: "Jordan", value: "JO" },
  { label: "Lebanon", value: "LB" },
  { label: "Iraq", value: "IQ" },
  { label: "Syria", value: "SY" },
  { label: "Yemen", value: "YE" },
  { label: "Palestine", value: "PS" },
  { label: "Egypt", value: "EG" },
  { label: "Sudan", value: "SD" },
  { label: "Libya", value: "LY" },
  { label: "Tunisia", value: "TN" },
  { label: "Algeria", value: "DZ" },
  { label: "Morocco", value: "MA" },
  { label: "Mauritania", value: "MR" },
  { label: "Somalia", value: "SO" },
  { label: "Djibouti", value: "DJ" },
  { label: "Comoros", value: "KM" },
];

const VAT_TREATMENT_OPTIONS = [
  { label: "Not VAT Registered in KSA", value: "not_registered" },
  { label: "VAT Registered in KSA", value: "registered" },
];

interface CustomerFormData {
  name: string;
  vatNumber?: string;
  country?: string;
  vatTreatment: string;
  address: {
    buildingNumber?: string;
    streetName?: string;
    district?: string;
    city?: string;
    postalCode?: string;
    additionalNumber?: string;
  };
}

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
        // Reset form and close modal
        form.reset();
        setOpen(false);

        // Notify parent component to refresh customer list
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
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your list. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[85vh]">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Customer name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer / Company Name*</FormLabel>
                    <Input
                      {...field}
                      placeholder="Enter customer / company name"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatTreatment"
                rules={{ required: "VAT treatment is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Treatment*</FormLabel>
                    <Combobox
                      placeholder="Select VAT treatment"
                      options={VAT_TREATMENT_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      showCreateButton={false}
                      isSearchEnabled={false}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Registration Number</FormLabel>
                    <Input
                      {...field}
                      placeholder="Enter tax registration number"
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Combobox
                      placeholder="Select country"
                      options={ARAB_COUNTRIES}
                      value={field.value || ""}
                      onChange={field.onChange}
                      showCreateButton={false}
                      isSearchEnabled={true}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Section */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Customer Address
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (Required for B2B invoices)
                  </span>
                </h3>
                
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="address.buildingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building Number</FormLabel>
                          <Input
                            {...field}
                            placeholder="e.g., 1234"
                            maxLength={4}
                            disabled={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <Input
                            {...field}
                            placeholder="e.g., 12345"
                            maxLength={5}
                            disabled={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address.streetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Name</FormLabel>
                        <Input
                          {...field}
                          placeholder="Enter street name"
                          disabled={isSubmitting}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="address.district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <Input
                            {...field}
                            placeholder="Enter district"
                            disabled={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Input
                            {...field}
                            placeholder="Enter city"
                            disabled={isSubmitting}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address.additionalNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Number (Optional)</FormLabel>
                        <Input
                          {...field}
                          placeholder="e.g., 5678"
                          maxLength={4}
                          disabled={isSubmitting}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
