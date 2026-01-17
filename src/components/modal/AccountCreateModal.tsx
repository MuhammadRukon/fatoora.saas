"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createAccount } from "@/lib/server-functions";

interface AccountCreateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAccountCreated: () => void;
}

export function AccountCreateModal({
  open,
  setOpen,
  onAccountCreated,
}: AccountCreateModalProps) {
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createAccount(accountName.trim());

      if (result.success) {
        setAccountName("");
        setOpen(false);
        onAccountCreated();
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAccountName("");
    setError("");
    setOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountName">Account*</Label>
          <Input
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., Sales, Services, Products"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Create"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
