<<<<<<< HEAD
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
  ],
  output: 'hybrid',
});
=======
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://renix.dev",

  output: "server",
  adapter: vercel(),

  integrations: [
    tailwind(),
    react(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/api/"),
    }),
  ],

  compressHTML: true,

  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },

  build: {
    inlineStylesheets: "auto",
  },
});
>>>>>>> cbbe2405399f00d3eb52549d05431e3c6386795e
