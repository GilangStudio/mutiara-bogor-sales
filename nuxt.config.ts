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
            ],
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
            navigateFallback: '/',
        },
        devOptions: {
            enabled: true,
            type: 'module',
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
                    src: 'icons/launchericon-48-48.png',
                    sizes: '48x48',
                    type: 'image/png',
                },
                {
                    src: 'icons/launchericon-72-72.png',
                    sizes: '72x72',
                    type: 'image/png',
                },
                {
                    src: 'icons/launchericon-96-96.png',
                    sizes: '96x96',
                    type: 'image/png',
                },
                {
                    src: 'icons/launchericon-144-144.png',
                    sizes: '144x144',
                    type: 'image/png',
                },
                {
                    src: 'icons/launchericon-192-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'icons/launchericon-512-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        }
    }
})