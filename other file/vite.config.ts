import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: "./",
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        viteSingleFile(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve("./src"),
        },
    },
}));
