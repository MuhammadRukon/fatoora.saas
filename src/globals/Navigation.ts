import { GlobalConfig } from "payload";

export const Navigation: GlobalConfig = {
  slug: "nav",
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "icon", type: "text" },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};