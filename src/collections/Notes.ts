import { Note } from "@payload-types";
import { CollectionConfig } from "payload";

export const Notes: CollectionConfig = {
  slug: "notes",
  admin: {
    useAsTitle: "noteNumber",
    defaultColumns: ["noteNumber", "documentType", "originalInvoice", "date", "total"],
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
    // ZATCA Phase 1 Requirement: Notes cannot be deleted (same as invoices)
    // Use status field to void/cancel notes instead
    delete: () => false,
  },
  fields: [
    {
      name: "noteNumber",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "documentType",
      type: "select",
      required: true,
      options: [
        {
          label: "Credit Note",
          value: "credit",
        },
        {
          label: "Debit Note",
          value: "debit",
        },
      ],
      admin: {
        description:
          "ZATCA Phase 1 Requirement: Credit Note for returns/refunds, Debit Note for additional charges",
      },
    },
    {
      name: "originalInvoice",
      type: "relationship",
      relationTo: "invoices" as any,
      required: true,
      admin: {
        description: "The original invoice this note is associated with",
      },
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
          "Note status - ZATCA requires notes cannot be deleted, only voided/cancelled",
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
      name: "reason",
      type: "text",
      required: true,
      admin: {
        description:
          "Reason for issuing this credit/debit note (e.g., 'Return of goods', 'Additional charges')",
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
      name: "qrCodeData",
      type: "textarea",
      admin: {
        description:
          "QR code data URL (base64 image) - ZATCA Phase 1: Mandatory for notes associated with Simplified invoices, optional for Standard invoices",
      },
      validate: async (value, { data, req }) => {
        const noteData = data as Note;
        // QR Code is mandatory for notes associated with simplified invoices (B2C)
        if (!noteData?.originalInvoice) return true; // Skip validation if invoice not yet selected

        try {
          const invoice = await req.payload.findByID({
            collection: "invoices",
            id:
              typeof noteData.originalInvoice === "string"
                ? noteData.originalInvoice
                : (noteData.originalInvoice as any).id,
          });

          if (invoice && (invoice as any).invoiceType === "simplified" && !value) {
            return "QR Code is mandatory for notes associated with Simplified Tax Invoices (B2C)";
          }
        } catch (error) {
          console.error(error);
          // If invoice lookup fails, skip validation
          return true;
        }

        return true;
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
                return sum + baseAmount;
              } else {
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
                return sum + (baseAmount * taxRate) / 100;
              } else {
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
        if (operation === "create" && data && !data.noteNumber) {
          // Determine prefix based on document type
          const prefix = data.documentType === "credit" ? "CN" : "DN";

          // Find last note of the same type
          const lastNote = await req.payload.find({
            collection: "notes" as any,
            limit: 1,
            sort: "-noteNumber",
            where: {
              documentType: {
                equals: data.documentType,
              },
            },
          });

          let nextNumber = 1;
          if (lastNote.docs.length > 0) {
            const lastNumberStr = (lastNote.docs[0] as any).noteNumber;
            const match = lastNumberStr.match(/-(\d+)$/);
            if (match) {
              nextNumber = parseInt(match[1]) + 1;
            }
          }

          data.noteNumber = `${prefix}-${nextNumber}`;
        }

        return data;
      },
    ],
  },
};
