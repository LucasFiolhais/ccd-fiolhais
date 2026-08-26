const STORAGE_PREFIX = 'ccd-fiolhais'

const cloneValue = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T
}

export const usePersistedState = <T>(key: string, initialValue: T) => {
  const storageKey = `${STORAGE_PREFIX}:${key}`

  const state = useState<T>(key, () => cloneValue(initialValue))

  if (import.meta.client) {
    const hasLoaded = useState<boolean>(`${key}-local-storage-loaded`, () => false)

    onMounted(() => {
      if (hasLoaded.value) {
        return
      }

      const storedValue = localStorage.getItem(storageKey)

      if (storedValue) {
        try {
          state.value = JSON.parse(storedValue) as T
        } catch {
          localStorage.removeItem(storageKey)
        }
      }

      hasLoaded.value = true
    })

    watch(
      state,
      (newValue) => {
        if (!hasLoaded.value) {
          return
        }

        localStorage.setItem(storageKey, JSON.stringify(newValue))
      },
      {
        deep: true
      }
    )
  }

  return state
}

export const clearPersistedProjectData = () => {
  if (import.meta.server) {
    return
  }

  Object.keys(localStorage)
    .filter((key) => key.startsWith(`${STORAGE_PREFIX}:`))
    .forEach((key) => {
      localStorage.removeItem(key)
    })
}