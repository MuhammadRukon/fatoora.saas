import { CollectionConfig } from "payload";

export const Invoices: CollectionConfig = {
  slug: "invoices",
  admin: {
    useAsTitle: "invoiceNumber",
    defaultColumns: ["invoiceNumber", "customer", "date", "total"],
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
    // ZATCA Phase 1 Requirement: Invoices cannot be deleted
    // Use status field to void/cancel invoices instead
    delete: () => false,
  },
  fields: [
    {
      name: "invoiceNumber",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Void",
          value: "void",
        },
        {
          label: "Cancelled",
          value: "cancelled",
        },
      ],
      admin: {
        description:
          "Invoice status - ZATCA requires invoices cannot be deleted, only voided/cancelled",
      },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers" as any,
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "dueDate",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "rowEntries",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "description",
          type: "text",
          required: true,
        },
        {
          name: "account",
          type: "text",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
        },
        {
          name: "taxRate",
          type: "number",
          required: true,
          min: 0,
          max: 100,
          defaultValue: 0,
        },
      ],
    },
    {
      name: "pricesExcludeTax",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "discountTotal",
      type: "number",
      defaultValue: 0,
      min: 0,
    },
    {
      name: "includeQRCode",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "qrCodeData",
      type: "textarea",
      admin: {
        description: "QR code data URL (base64 image)",
      },
    },
    {
      name: "subtotal",
      type: "number",
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data?.rowEntries) return 0;
            const pricesExcludeTax = data?.pricesExcludeTax ?? true;

            return data.rowEntries.reduce((sum: number, item: any) => {
              const baseAmount = (item.quantity || 0) * (item.price || 0);
              if (pricesExcludeTax) {
                // Subtotal is base amount (excl. VAT)
                return sum + baseAmount;
              } else {
                // Subtotal is base amount minus VAT (extract base from price that includes VAT)
                const taxRate = item.taxRate || 0;
                const baseWithoutVAT = baseAmount / (1 + taxRate / 100);
                return sum + baseWithoutVAT;
              }
            }, 0);
          },
        ],
      },
    },
    {
      name: "totalTax",
      type: "number",
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data?.rowEntries) return 0;
            const pricesExcludeTax = data?.pricesExcludeTax ?? true;

            return data.rowEntries.reduce((sum: number, item: any) => {
              const baseAmount = (item.quantity || 0) * (item.price || 0);
              const taxRate = item.taxRate || 0;

              if (pricesExcludeTax) {
                // VAT calculated on base amount
                return sum + (baseAmount * taxRate) / 100;
              } else {
                // VAT extracted from price that includes VAT
                const vatAmount = baseAmount - baseAmount / (1 + taxRate / 100);
                return sum + vatAmount;
              }
            }, 0);
          },
        ],
      },
    },
    {
      name: "total",
      type: "number",
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data?.rowEntries) return 0;
            const pricesExcludeTax = data?.pricesExcludeTax ?? true;

            // Calculate subtotal
            const subtotal = data.rowEntries.reduce((sum: number, item: any) => {
              const baseAmount = (item.quantity || 0) * (item.price || 0);
              if (pricesExcludeTax) {
                return sum + baseAmount;
              } else {
                const taxRate = item.taxRate || 0;
                const baseWithoutVAT = baseAmount / (1 + taxRate / 100);
                return sum + baseWithoutVAT;
              }
            }, 0);

            // Calculate tax
            const totalTax = data.rowEntries.reduce((sum: number, item: any) => {
              const baseAmount = (item.quantity || 0) * (item.price || 0);
              const taxRate = item.taxRate || 0;

              if (pricesExcludeTax) {
                return sum + (baseAmount * taxRate) / 100;
              } else {
                const vatAmount = baseAmount - baseAmount / (1 + taxRate / 100);
                return sum + vatAmount;
              }
            }, 0);

            const discount = data?.discountTotal || 0;
            return subtotal + totalTax - discount;
          },
        ],
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
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === "create" && data && !data.invoiceNumber) {
          const lastInvoice = await req.payload.find({
            collection: "invoices" as any,
            limit: 1,
            sort: "-invoiceNumber",
          });

          let nextNumber = 1;
          if (lastInvoice.docs.length > 0) {
            const lastNumber = parseInt(
              (lastInvoice.docs[0] as any).invoiceNumber.split("-")[1]
            );
            nextNumber = lastNumber + 1;
          }

          data.invoiceNumber = `INV-${nextNumber}`;
        }

        return data;
      },
    ],
  },
};
