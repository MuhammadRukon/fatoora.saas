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
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combo-box";
import { useState } from "react";
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

export function CustomerCreateModal({
  open,
  setOpen,
  onCustomerCreated,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCustomerCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [taxRegNum, setTaxRegNum] = useState("");
  const [country, setCountry] = useState("");
  const [vatTreatment, setVatTreatment] = useState("not_registered");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCustomer = async () => {
    console.log("handleCreateCustomer called with:", { name, taxRegNum, country, vatTreatment });

    if (!name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!vatTreatment) {
      setError("VAT treatment is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Calling createCustomer...");
      const customerData = {
        name: name.trim(),
        taxRegNum: taxRegNum.trim() || undefined,
        country: country || undefined,
        vatTreatment,
      };
      const result = await createCustomer(customerData);
      console.log("Result:", result);

      if (result.success) {
        console.log("Customer created successfully:", result.customer);

        // Reset form and close modal
        setName("");
        setTaxRegNum("");
        setCountry("");
        setVatTreatment("not_registered");
        setOpen(false);

        // Notify parent component to refresh customer list
        if (onCustomerCreated) {
          onCustomerCreated();
        }
      } else {
        console.error("Failed to create customer:", result.error);
        setError(result.error || "Failed to create customer. Please try again.");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submitted");
    await handleCreateCustomer();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setTaxRegNum("");
      setCountry("");
      setVatTreatment("not_registered");
      setError("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your list. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-3">
              <Label htmlFor="customer-name">Customer / Company Name*</Label>
              <Input
                id="customer-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer / company name"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            
            <div className="grid gap-3">
              <Label htmlFor="vat-treatment">VAT Treatment*</Label>
              <Combobox
                placeholder="Select VAT treatment"
                options={VAT_TREATMENT_OPTIONS}
                value={vatTreatment}
                onChange={setVatTreatment}
                showCreateButton={false}
                isSearchEnabled={false}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="tax-reg-num">Tax Registration Number</Label>
              <Input
                id="tax-reg-num"
                name="taxRegNum"
                value={taxRegNum}
                onChange={(e) => setTaxRegNum(e.target.value)}
                placeholder="Enter tax registration number"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="country">Country</Label>
              <Combobox
                placeholder="Select country"
                options={ARAB_COUNTRIES}
                value={country}
                onChange={setCountry}
                showCreateButton={false}
                isSearchEnabled={true}
              />
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
            <Button type="button" disabled={isSubmitting} onClick={handleCreateCustomer}>
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
