import sharp from "sharp";
import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { buildConfig } from "payload";
import { Users } from "./src/collections/Users";
import { Invoices } from "./src/collections/Invoices";
import { Customers } from "./src/collections/Customers";
import { Accounts } from "./src/collections/Accounts";
import { Media } from "./src/collections/Media";
import { Notes } from "./src/collections/Notes";
import path from "path";
import { fileURLToPath } from "url";
import { bnBd } from "@payloadcms/translations/languages/bnBd";
import { en } from "@payloadcms/translations/languages/en";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor({
    features({ defaultFeatures }) {
      return [...defaultFeatures, FixedToolbarFeature()];
    },
  }),

  plugins: process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: {
            media: true,
          },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : [],

  // Define and configure your collections in this array
  collections: [Users, Invoices, Customers, Accounts, Media, Notes],

  //Define and configure globals (single documents)
  globals: [],

  admin: {
    user: "users",
    components: {
      graphics: { Logo: { path: "./src/components/logo/logo#Logo" } },
    },
  },
  // Multi language for admin UI
  i18n: {
    fallbackLanguage: "en",
    supportedLanguages: { en, "bn-BD": bnBd },
  },

  // Multi language for content
  localization: {
    locales: [
      {
        label: "English",
        code: "en",
      },
      {
        label: "Bangla",
        code: "bn-BD",
      },
    ],
    defaultLocale: "en",
    fallback: true,
  },

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  // white listed urls
  cors: ["http://localhost:3000"],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
});
