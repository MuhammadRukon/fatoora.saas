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
import { useState } from "react";
import { createCustomer } from "@/lib/server-functions";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCustomer = async () => {
    console.log("handleCreateCustomer called with name:", name);

    if (!name.trim()) {
      setError("Customer name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Calling createCustomer...");
      const result = await createCustomer(name.trim());
      console.log("Result:", result);

      if (result.success) {
        console.log("Customer created successfully:", result.customer);

        // Reset form and close modal
        setName("");
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="customer-name">Customer Name*</Label>
              <Input
                id="customer-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                disabled={isSubmitting}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
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
