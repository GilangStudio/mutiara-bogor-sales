// composables/useDebouncedSearch.ts
export interface DebouncedSearchOptions {
    delay?: number
    immediate?: boolean
    minLength?: number
}

export const useDebouncedSearch = (
    searchFunction: (query: string) => void | Promise<void>,
    options: DebouncedSearchOptions = {}
) => {
    const {
        delay = 500,
        immediate = false,
        minLength = 0
    } = options

    const searchQuery = ref('')
    const isSearching = ref(false)
    const lastSearchTime = ref(0)
    
    let timeoutId: NodeJS.Timeout | null = null

    const executeSearch = async (query: string) => {
        if (query.length < minLength && query.length > 0) {
            return
        }

        try {
            isSearching.value = true
            lastSearchTime.value = Date.now()
            await searchFunction(query)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            isSearching.value = false
        }
    }

    const debouncedSearch = (query: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        if (immediate && query.length >= minLength) {
            executeSearch(query)
        } else {
            timeoutId = setTimeout(() => {
                executeSearch(query)
            }, delay)
        }
    }

    // Watch searchQuery for changes
    watch(searchQuery, (newQuery, oldQuery) => {
        // Don't search if query hasn't actually changed
        if (newQuery === oldQuery) return
        
        debouncedSearch(newQuery)
    })

    const clearSearch = () => {
        searchQuery.value = ''
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
    }

    const forceSearch = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        executeSearch(searchQuery.value)
    }

    // Cleanup on unmount
    onUnmounted(() => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
    })

    return {
        searchQuery,
        isSearching,
        lastSearchTime,
        clearSearch,
        forceSearch,
        debouncedSearch
    }
}