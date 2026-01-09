import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                return savedTheme
            }
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark'
            }
        }
        return 'light'
    })
    
    const [isInitialized, setIsInitialized] = useState(false)
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme)
            
            // Add data-theme attribute to html element
            document.documentElement.setAttribute('data-theme', theme)
            
            // Add/remove dark class from body
            if (theme === 'dark') {
                document.body.classList.add('dark')
                document.body.classList.remove('light')
            } else {
                document.body.classList.add('light')
                document.body.classList.remove('dark')
            }
            
            // Add transition class for smooth theme switching
            document.body.classList.add('theme-transition-ready')
            
            // Mark as initialized after first render
            if (!isInitialized) {
                setIsInitialized(true)
            }
        }
    }, [theme, isInitialized])
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }
    
    const setThemeDirect = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme)
        }
    }
    
    return (
        <ThemeContext.Provider value={{ 
            theme, 
            toggleTheme, 
            setTheme: setThemeDirect,
            isInitialized 
        }}>
            {children}
        </ThemeContext.Provider>
    )
}