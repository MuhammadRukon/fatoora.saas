import { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  defaultPopulate: {
    email: true,
    id: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          id: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    update: ({ req: { user } }) => {
      if (user) {
        if (user.role === "admin") {
          return true;
        }
        return {
          id: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      return user?.role === "admin";
    },
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      required: true,
    },
    {
      name: "photoUrl",
      type: "text",
      required: false,
    },
    {
      name: "companyName",
      type: "text",
      required: false,
    },
    {
      name: "companyNameArabic",
      type: "text",
      required: false,
    },
    {
      name: "vatNumber",
      type: "text",
      required: false,
      label: "VAT Registration Number",
      admin: {
        description: "15-digit VAT registration number (e.g., 300000000000003)",
      },
    },
    {
      name: "registrationNumber",
      type: "text",
      required: false,
      label: "Commercial Registration Number",
      admin: {
        description:
          "Commercial Registration (CR) number issued by Ministry of Commerce (ZATCA Phase 2 requirement)",
      },
    },
    {
      name: "address",
      type: "group",
      label: "Company Address",
      admin: {
        description:
          "ZATCA Phase 1 Requirement (Article 53): Complete address must be included on all invoices",
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
            description: "Street name in English",
          },
        },
        {
          name: "streetNameArabic",
          type: "text",
          label: "Street Name Arabic",
          admin: {
            description: "Street name in Arabic",
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
          name: "districtArabic",
          type: "text",
          label: "District Arabic",
          admin: {
            description: "District/Neighborhood name in Arabic",
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
          name: "cityArabic",
          type: "text",
          label: "City Arabic",
          admin: {
            description: "City name in Arabic",
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
          name: "country",
          type: "text",
          label: "Country",
          defaultValue: "Saudi Arabia",
          admin: {
            description: "Country name (default: Saudi Arabia)",
          },
        },
        {
          name: "countryArabic",
          type: "text",
          label: "Country Arabic",
          defaultValue: "Saudi Arabia",
          admin: {
            description: "Country name in Arabic (default: Saudi Arabia)",
          },
        }
      ],
    },
    {
      name: "phone",
      type: "text",
      required: false,
      label: "Phone Number",
    },
    {
      name: "companyLogo",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === "admin",
        update: ({ req: { user } }) => user?.role === "admin",
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === "create" && req.user?.role !== "admin") {
              return "user";
            }
            return value;
          },
        ],
      },
    },
  ],
};
