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
      name: "vatNumber",
      type: "text",
      required: false,
    },
    {
      name: "country",
      type: "text",
      required: false,
    },
    {
      name: "phone",
      type: "text",
      required: false,
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
