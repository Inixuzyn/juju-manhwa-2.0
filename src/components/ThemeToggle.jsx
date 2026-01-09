import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()
    const [isAnimating, setIsAnimating] = useState(false)
    
    const handleClick = () => {
        setIsAnimating(true)
        toggleTheme()
        setTimeout(() => setIsAnimating(false), 300)
    }
    
    useEffect(() => {
        // Add animation class to body for theme transition
        document.body.classList.add('theme-transition')
        const timer = setTimeout(() => {
            document.body.classList.remove('theme-transition')
        }, 300)
        
        return () => clearTimeout(timer)
    }, [theme])
    
    return (
        <button
            onClick={handleClick}
            className={`relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isAnimating ? 'scale-110' : ''
            }`}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <div className="relative w-6 h-6 overflow-hidden">
                {/* Sun Icon */}
                <div className={`absolute inset-0 transition-all duration-300 transform ${
                    theme === 'light'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 rotate-90 scale-0'
                }`}>
                    <FontAwesomeIcon
                        icon={faSun}
                        className="w-full h-full text-yellow-500"
                    />
                </div>
                {/* Moon Icon */}
                <div className={`absolute inset-0 transition-all duration-300 transform ${
                    theme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-0'
                }`}>
                    <FontAwesomeIcon
                        icon={faMoon}
                        className="w-full h-full text-blue-400"
                    />
                </div>
            </div>
            
            {/* Animation circle */}
            {isAnimating && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-ping"></div>
            )}
        </button>
    )
}

export default ThemeToggle