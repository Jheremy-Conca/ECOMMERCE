export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  app: {
    head: {
      titleTemplate: "%s | Mi Tienda",
      meta: [
        {
          name: "description",
          content: "Encuentra los mejores productos al mejor precio.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
  devtools: { enabled: true },
  components: [{ path: "~/components", pathPrefix: false }],
  modules: [
    "@pinia/nuxt",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
  ],
  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api",
    },
  },
});
