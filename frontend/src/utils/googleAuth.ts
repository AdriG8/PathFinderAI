let googleScriptLoaded = false
let googleScriptLoading = false
let googleInitialized = false

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }
    
    if (googleScriptLoaded) {
      resolve()
      return
    }
    
    if (googleScriptLoading) {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          resolve()
        }
      }, 100)
      return
    }
    
    googleScriptLoading = true
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      googleScriptLoaded = true
      googleScriptLoading = false
      resolve()
    }
    script.onerror = () => {
      googleScriptLoading = false
      reject(new Error('Failed to load Google script'))
    }
    document.head.appendChild(script)
  })
}

export const initializeGoogle = async (callback: (response: { credential: string }) => void, clientId: string) => {
  await loadGoogleScript()
  
  if (window.google && !googleInitialized) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: callback,
    })
    googleInitialized = true
  }
}