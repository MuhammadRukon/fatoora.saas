import { GlobalConfig } from "payload";

export const Home: GlobalConfig = {
  slug: "home",

  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Title",
    },
    {
      name: "summary",
      type: "text",
      label: "Summary",
    },
    {
      name: "designations",
      type: "array",
      required: true,
      fields: [{ name: "designation", type: "text", required: true }],
    },
    {
      name: "socials",
      type: "array",
      fields: [
        { name: "link", type: "text", required: true },
        { name: "icon", type: "text" },
      ],
    },
    {
      name: "resume",
      type: "relationship",
      relationTo: "media",
    },
  ],
};
