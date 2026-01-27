"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combo-box";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const ARAB_COUNTRIES = [
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

export const VAT_TREATMENT_OPTIONS = [
  { label: "Not VAT Registered in KSA", value: "not_registered" },
  { label: "VAT Registered in KSA", value: "registered" },
];

export interface CustomerFormData {
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

interface CustomerFormProps {
  form: ReturnType<typeof useForm<CustomerFormData>>;
  isSubmitting?: boolean;
  isLoading?: boolean;
  showAddressTitle?: boolean;
  addressLayout?: "grid" | "default";
}

export function CustomerForm({
  form,
  isSubmitting = false,
  isLoading = false,
  showAddressTitle = true,
  addressLayout = "default",
}: CustomerFormProps) {
  const disabled = isSubmitting || isLoading;

  return (
    <Form {...form}>
      <div className="grid gap-4 py-4">
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
                disabled={disabled}
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
                disabled={disabled}
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
          {showAddressTitle && (
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Customer Address
              <span className="text-xs font-normal text-gray-500 ml-2">
                (Required for B2B invoices)
              </span>
            </h3>
          )}

          {addressLayout === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.buildingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Number</FormLabel>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder="e.g., 1234"
                      maxLength={4}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.streetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Name</FormLabel>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder="Enter street name"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Input {...field} disabled={disabled} placeholder="Enter district" />
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
                    <Input {...field} disabled={disabled} placeholder="Enter city" />
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
                      disabled={disabled}
                      placeholder="e.g., 12345"
                      maxLength={5}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.additionalNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Number (Optional)</FormLabel>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder="e.g., 5678"
                      maxLength={4}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
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
                        disabled={disabled}
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
                        disabled={disabled}
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
                      disabled={disabled}
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
                        disabled={disabled}
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
                      <Input {...field} placeholder="Enter city" disabled={disabled} />
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
                      disabled={disabled}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </Form>
  );
}


