"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useState, useRef } from "react";
import { updateCompanyInfo, uploadCompanyLogo } from "@/lib/server-functions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { UserData } from "../container/container";

interface CompanyInfoData {
  companyName: string;
  companyNameArabic: string;
  vatNumber: string;
  registrationNumber: string;
  address: {
    buildingNumber: string;
    streetName: string;
    streetNameArabic: string;
    district: string;
    districtArabic: string;
    city: string;
    cityArabic: string;
    postalCode: string;
    country: string;
    countryArabic: string;
  };
  phone: string;
}

// company is user
export function CompanyInfoForm({ company }: { company: UserData }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(
    company?.companyLogo?.url || null
  );
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CompanyInfoData>({
    defaultValues: {
      companyName: company?.companyName || "",
      companyNameArabic: company?.companyNameArabic || "",
      vatNumber: company?.vatNumber || "",
      registrationNumber: company?.registrationNumber || "",
      address: {
        buildingNumber: company?.address?.buildingNumber || "",
        streetName: company?.address?.streetName || "",
        streetNameArabic: company?.address?.streetNameArabic || "",
        district: company?.address?.district || "",
        districtArabic: company?.address?.districtArabic || "",
        city: company?.address?.city || "",
        cityArabic: company?.address?.cityArabic || "",
        postalCode: company?.address?.postalCode || "",
        country: company?.address?.country || "Saudi Arabia",
        countryArabic: company?.address?.countryArabic || "Saudi Arabia",
      },
      phone: company?.phone || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setNewLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleRemoveLogo = () => {
    setNewLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CompanyInfoData) => {
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      // Upload new logo if selected
      if (newLogoFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", newLogoFile);

        const uploadResult = await uploadCompanyLogo(formData);
        setIsUploading(false);

        if (!uploadResult.success) {
          setError(uploadResult.error || "Failed to upload logo");
          setIsSaving(false);
          return;
        }
      }

      // Update company info
      const result = await updateCompanyInfo(data);

      if (result.success) {
        setSuccessMessage("Company information updated successfully!");
        setNewLogoFile(null);
        // Refresh the page to show updated data
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || "Failed to update company information");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-6 mb-8">
          {/* Logo Display */}
          <div className="border border-gray-200 shadow-xs flex items-center justify-center w-60 h-60 relative rounded-lg overflow-hidden bg-gray-50">
            {logoPreview ? (
              <>
                <Image
                  src={logoPreview}
                  alt="Company logo"
                  fill
                  sizes="(max-width: 768px) 100px, 150px"
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload className="w-12 h-12" />
                <p className="text-sm">No logo uploaded</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || isUploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </Button>
            <p className="text-xs text-gray-500">
              Max size: 5MB. Formats: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Company Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <Input {...field} placeholder="Enter company name" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyNameArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Arabic)</FormLabel>
                    <Input {...field} placeholder="Enter company name in Arabic" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <Input {...field} placeholder="Enter phone number" type="tel" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <Input {...field} placeholder="Enter 15-digit VAT number" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commercial Registration Number</FormLabel>
                    <Input {...field} placeholder="Enter 10-digit CR number" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Company Address - ZATCA Required */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Company Address
              <span className="text-sm font-normal text-red-600 ml-2">
                (ZATCA Required)
              </span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Complete address must be included on all invoices per Article 53, VAT
              Implementing Regulations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address.buildingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Number</FormLabel>
                    <Input {...field} placeholder="e.g., 1234" maxLength={4} />
                  </FormItem>
                )}
              />

              
<FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <Input {...field} placeholder="e.g., 12345" maxLength={5} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.streetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Name (English)</FormLabel>
                    <Input {...field} placeholder="Enter street name" />
                  </FormItem>
                )}
              />

<FormField
                control={form.control}
                name="address.streetNameArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Name (Arabic)</FormLabel>
                    <Input {...field} placeholder="Enter street name in Arabic" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District (English)</FormLabel>
                    <Input {...field} placeholder="Enter district/neighborhood" />
                  </FormItem>
                )}
              />

<FormField
                control={form.control}
                name="address.districtArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District (Arabic)</FormLabel>
                    <Input {...field} placeholder="Enter district/neighborhood in Arabic" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (English)</FormLabel>
                    <Input {...field} placeholder="Enter city" />
                  </FormItem>
                )}
              />

<FormField
                control={form.control}
                name="address.cityArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (Arabic)</FormLabel>
                    <Input {...field} placeholder="Enter city in Arabic" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (English)</FormLabel>
                    <Input {...field} placeholder="Saudi Arabia" />
                  </FormItem>
                )}
              />

<FormField
                control={form.control}
                name="address.countryArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (Arabic)</FormLabel>
                    <Input {...field} placeholder="Enter country in Arabic" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving || isUploading}>
            {isUploading ? "Uploading logo..." : isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving || isUploading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
