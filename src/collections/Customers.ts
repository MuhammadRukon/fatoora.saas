import { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name"],
  },
  access: {
    // Users can only read/update/delete their own customers
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
      name: "taxRegNum",
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
