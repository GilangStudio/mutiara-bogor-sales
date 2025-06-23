<template>
    <div class="mobile-container">
        <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div class="w-full max-w-sm text-center space-y-8">
  
        <!-- Error Content -->
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-foreground">
            Oops! Halaman Tidak Ditemukan
          </h1>

          <!-- Main 404 Visual -->
          <div class="relative">
            <!-- Large 404 Text -->
            <div class="text-8xl font-black text-primary/40 leading-none mb-4 select-none">
              404
            </div>
          </div>
          
          <p class="text-muted-foreground leading-relaxed px-4">
            Sepertinya halaman yang Anda cari telah berpindah, dihapus, atau mungkin tidak pernah ada. 
            Jangan khawatir, mari kita bantu Anda menemukan jalan kembali.
          </p>
        </div>

        
  
        <!-- Helpful Suggestions -->
        <div class="bg-card border border-border rounded-lg p-4 text-left space-y-3">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <Lightbulb class="h-4 w-4 text-yellow-500" />
            Saran untuk Anda:
          </h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Periksa kembali URL yang Anda ketik</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Gunakan menu navigasi di bawah untuk browsing</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>Kembali ke halaman sebelumnya</span>
            </li>
          </ul>
        </div>
  
        <!-- Navigation Actions -->
        <div class="space-y-3">
          <button 
            @click="goHome"
            class="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Home class="h-4 w-4" />
            Kembali ke Beranda
          </button>
          
          <button 
            @click="goBack"
            class="w-full py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft class="h-4 w-4" />
            Halaman Sebelumnya
          </button>
        </div>
  
      </div>
    </div>
    </div>
  </template>
  
  <script setup>
  import { Search, Lightbulb, Home, ArrowLeft } from 'lucide-vue-next'
  
  // Actions
  const goHome = () => {
    navigateTo('/')
  }
  
  const goBack = () => {
    if (process.client) {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        navigateTo('/')
      }
    }
  }
  
  // SEO
  useHead({
    title: '404 - Halaman Tidak Ditemukan',
    meta: [
      { name: 'description', content: 'Halaman yang Anda cari tidak ditemukan' },
      { name: 'robots', content: 'noindex' }
    ]
  })
  </script>
  
  <style scoped>
  .animation-delay-1000 {
    animation-delay: 1000ms;
  }
  .animation-delay-1500 {
    animation-delay: 1500ms;
  }
  .animation-delay-2000 {
    animation-delay: 2000ms;
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-30px,0);
    }
    70% {
      transform: translate3d(0,-15px,0);
    }
    90% {
      transform: translate3d(0,-4px,0);
    }
  }
  </style>