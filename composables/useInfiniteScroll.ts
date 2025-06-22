// composables/useInfiniteScroll.ts
export interface InfiniteScrollOptions {
    threshold?: number
    rootMargin?: string
    disabled?: Ref<boolean>
}

export const useInfiniteScroll = (
    callback: () => void | Promise<void>,
    options: InfiniteScrollOptions = {}
) => {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        disabled = ref(false)
    } = options

    const target = ref<HTMLElement>()
    const isIntersecting = ref(false)
    let observer: IntersectionObserver | null = null

    const start = () => {
        if (!process.client || !target.value || disabled.value) return

        stop() // Stop existing observer

        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                isIntersecting.value = entry.isIntersecting
                
                if (entry.isIntersecting && !disabled.value) {
                    callback()
                }
            },
            {
                threshold,
                rootMargin
            }
        )

        observer.observe(target.value)
    }

    const stop = () => {
        if (observer) {
            observer.disconnect()
            observer = null
        }
        isIntersecting.value = false
    }

    // Watch for target changes
    watch(target, (newTarget) => {
        if (newTarget) {
            nextTick(() => start())
        } else {
            stop()
        }
    })

    // Watch for disabled changes
    watch(disabled, (isDisabled) => {
        if (isDisabled) {
            stop()
        } else if (target.value) {
            start()
        }
    })

    // Cleanup on unmount
    onUnmounted(() => {
        stop()
    })

    return {
        target,
        isIntersecting,
        start,
        stop
    }
}