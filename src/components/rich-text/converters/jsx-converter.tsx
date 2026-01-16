// // import type {
// //   TableOfContents as TableOfContentsProps,
// //   ContentWithMedia as ContentWithMediaProps,
// // } from "@/payload-types";

// import { DefaultNodeTypes, SerializedBlockNode } from "@payloadcms/richtext-lexical";
// import {
//   JSXConvertersFunction,
//   LinkJSXConverter,
// } from "@payloadcms/richtext-lexical/react";

// import { internalDocToHref } from "@/components/rich-text/converters/internal-link";
// import { headingConverter } from "@/components/rich-text/converters/heading-converter";
// import { ContentWithMedia } from "../blocks/content-with-media";
// import { TableOfContents } from "../blocks/table-of-content";

// type NodeTypes = DefaultNodeTypes | SerializedBlockNode<any | any>;
// // type NodeTypes =
// //   | DefaultNodeTypes
// //   | SerializedBlockNode<TableOfContentsProps | ContentWithMediaProps>;

// export const jsxConverter: JSXConvertersFunction<NodeTypes> = ({
//   defaultConverters,
// }) => ({
//   ...defaultConverters,
//   ...LinkJSXConverter({ internalDocToHref }),
//   ...headingConverter,
//   blocks: {
//     contentWithMedia: ({ node }) => <ContentWithMedia {...node.fields} />,
//     tableOfContents: ({ node }) => <TableOfContents {...node.fields} />,
//   },
// });
