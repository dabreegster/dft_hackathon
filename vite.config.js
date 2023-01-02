import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "/dft_hackathon/",
  plugins: [svelte()],
});
