import { CollectionConfig } from "payload";

export const Accounts: CollectionConfig = {
  slug: "accounts",
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
