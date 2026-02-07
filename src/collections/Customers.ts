import { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name"],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          createdBy: {
            equals: user.id,
          },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Customer Name",
    },
    {
      name: "branch",
      type: "text",
      label: "Branch Name",
    },
    {
      name: "vatNumber",
      type: "text",
      label: "Tax Registration Number",
      admin: {
        description: "VAT registration number (if applicable)",
      },
    },
    {
      name: "country",
      type: "select",
      label: "Country",
      options: [
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
      ],
    },
    {
      name: "vatTreatment",
      type: "select",
      label: "VAT Treatment",
      required: true,
      defaultValue: "not_registered",
      options: [
        { label: "Not VAT Registered in KSA", value: "not_registered" },
        { label: "VAT Registered in KSA", value: "registered" },
      ],
      admin: {
        description: "Customer's VAT registration status in Saudi Arabia",
      },
    },
    {
      name: "address",
      type: "group",
      label: "Customer Address",
      admin: {
        description:
          "ZATCA Phase 1 Requirement (Article 53): Address required for B2B invoices (Standard Tax Invoices)",
      },
      fields: [
        {
          name: "buildingNumber",
          type: "text",
          label: "Building Number",
          admin: {
            description: "Building number (4 digits, e.g., 1234)",
          },
        },
        {
          name: "streetName",
          type: "text",
          label: "Street Name",
          admin: {
            description: "Street name in Arabic or English",
          },
        },
        {
          name: "district",
          type: "text",
          label: "District",
          admin: {
            description: "District/Neighborhood name",
          },
        },
        {
          name: "city",
          type: "text",
          label: "City",
          admin: {
            description: "City name",
          },
        },
        {
          name: "postalCode",
          type: "text",
          label: "Postal Code",
          admin: {
            description: "5-digit postal code (e.g., 12345)",
          },
        },
        {
          name: "additionalNumber",
          type: "text",
          label: "Additional Number",
          admin: {
            description: "Additional number (4 digits, optional)",
          },
        },
      ],
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === "create") {
              return req.user?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
};
