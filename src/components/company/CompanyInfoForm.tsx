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

interface CompanyInfoData {
  companyName: string;
  country: string;
  taxRegNum: string;
  phone: string;
}

interface CompanyInfoFormProps {
  initialData?: {
    companyName?: string;
    country?: string;
    taxRegNum?: string;
    phone?: string;
    companyLogo?: {
      id: string;
      url: string;
      alt?: string;
    } | null;
  };
}

export function CompanyInfoForm({ initialData }: CompanyInfoFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.companyLogo?.url || null
  );
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CompanyInfoData>({
    defaultValues: {
      companyName: initialData?.companyName || "",
      country: initialData?.country || "",
      taxRegNum: initialData?.taxRegNum || "",
      phone: initialData?.phone || "",
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Input {...field} placeholder="Enter country" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxRegNum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Registration Number</FormLabel>
                <Input {...field} placeholder="Enter tax registration number" />
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
