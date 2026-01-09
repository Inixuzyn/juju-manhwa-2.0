import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faNewspaper, faFire, faBookOpen, faChartLine, faHistory, faInfinity, faSearch } from '@fortawesome/free-solid-svg-icons'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const location = useLocation()
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    const navLinks = [
        { name: 'Home', path: '/', icon: faHome },
        { name: 'Terbaru', path: '/terbaru', icon: faNewspaper },
        { name: 'Trending', path: '/trending', icon: faFire },
        { name: 'Pustaka', path: '/pustaka', icon: faBookOpen },
        { name: 'All Comic', path: '/unlimited', icon: faInfinity },
        { name: 'Statistics', path: '/statistics', icon: faChartLine },
        { name: 'History', path: '/history', icon: faHistory },
    ].filter(link => {
        const isProduction = import.meta.env.PROD;
        if (isProduction && link.path === '/statistics') {
            return false;
        }
        return true;
    });
    
    const isActive = (path) => {
        return location.pathname === path
    }
    
    const isUnlimitedPage = location.pathname === '/unlimited';
    
    const handleLinkClick = () => {
        setIsMenuOpen(false)
        window.scrollTo(0, 0)
    }
    
    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-800 shadow-lg' 
                : 'bg-white/80 dark:bg-gray-900/80 border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-3 group"
                        onClick={handleLinkClick}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transition-all group-hover:from-indigo-500 group-hover:to-purple-500">
                                KanataToon
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Baca Komik Gratis</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation & Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={handleLinkClick}
                                    className={`
                                        relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group/nav
                                        ${isActive(link.path)
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }
                                    `}
                                >
                                    {isActive(link.path) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg"></div>
                                    )}
                                    <span className="relative flex items-center gap-2">
                                        <FontAwesomeIcon 
                                            icon={link.icon} 
                                            className={`transition-transform group-hover/nav:scale-110 ${
                                                isActive(link.path) ? 'text-white' : ''
                                            }`}
                                        />
                                        {link.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Quick Search */}
                        <Link
                            to="/"
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => {
                                document.querySelector('input[type="text"]')?.focus()
                                window.scrollTo({ top: 200, behavior: 'smooth' })
                            }}
                        >
                            <FontAwesomeIcon icon={faSearch} />
                            <span className="text-sm">Cari Komik</span>
                        </Link>

                        {/* Theme Toggle */}
                        {!isUnlimitedPage && <ThemeToggle />}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative w-10 h-10"
                            aria-label="Toggle menu"
                        >
                            <span className="sr-only">Toggle menu</span>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></div>
                                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Mobile menu */}
            <div className={`md:hidden border-t transition-all duration-300 ease-in-out overflow-hidden ${
                isMenuOpen 
                    ? 'max-h-96 opacity-100 border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95' 
                    : 'max-h-0 opacity-0 border-transparent'
            }`}>
                <div className="px-4 py-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={handleLinkClick}
                            className={`
                                block px-4 py-3 rounded-lg font-medium transition-all duration-300
                                ${isActive(link.path)
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                            `}
                        >
                            <span className="flex items-center gap-3">
                                <FontAwesomeIcon 
                                    icon={link.icon} 
                                    className={`text-lg ${isActive(link.path) ? 'text-white' : ''}`}
                                />
                                {link.name}
                                {isActive(link.path) && (
                                    <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                )}
                            </span>
                        </Link>
                    ))}
                    {/* Quick Search Mobile */}
                    <button
                        onClick={() => {
                            setIsMenuOpen(false)
                            document.querySelector('input[type="text"]')?.focus()
                            window.scrollTo({ top: 200, behavior: 'smooth' })
                        }}
                        className="w-full px-4 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-3"
                    >
                        <FontAwesomeIcon icon={faSearch} className="text-lg" />
                        Cari Komik
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar