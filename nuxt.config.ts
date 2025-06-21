// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/tailwindcss',
        'shadcn-nuxt',
        '@nuxtjs/color-mode',
        '@pinia/nuxt',
        '@vite-pwa/nuxt'
    ],
    shadcn: {
        prefix: '',
        componentDir: './components/ui'
    },
    colorMode: {
        classSuffix: ''
    },
    css: ['~/assets/css/main.css'],
    app: {
        head: {
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
            meta: [
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'theme-color', content: '#3b82f6' }
            ]
        }
    },
    runtimeConfig: {
        public: {
            apiBase: 'https://be-mutiara-bogor.go/api'
        }
    },
    pwa: {
        registerType: 'autoUpdate',
        workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico}']
        },
        client: {
            installPrompt: true
        },
        devOptions: {
            enabled: true,
            suppressWarnings: true,
            navigateFallbackAllowlist: [/^\/$/],
            type: 'module'
        },
        manifest: {
            name: 'CRM Sales App',
            short_name: 'CRM Sales',
            description: 'Aplikasi CRM Sales untuk manajemen leads dan penjualan',
            theme_color: '#3b82f6',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        }
    }
})