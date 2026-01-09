import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faChevronLeft, 
    faChevronRight, 
    faHome, 
    faBookOpen, 
    faExpand, 
    faCompress, 
    faSpinner,
    faEye,
    faList,
    faPause,
    faPlay,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faRedo,
    faBars
} from '@fortawesome/free-solid-svg-icons';

const ReadComic = () => {
    const navigate = useNavigate();
    const { slug, chapterSlug } = useParams();
    const location = useLocation();
    
    const { 
        chapterLink, 
        comicTitle, 
        chapterNumber,
        comicDetailState
    } = location.state || {};
    
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentChapters, setCurrentChapters] = useState([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [navigation, setNavigation] = useState({
        previousChapter: null,
        nextChapter: null,
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showChapterList, setShowChapterList] = useState(false);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [imageLoadingErrors, setImageLoadingErrors] = useState(new Set());
    const [scrollDirection, setScrollDirection] = useState('down');
    const [scrollPosition, setScrollPosition] = useState(0);
    
    const comicContainerRef = useRef(null);
    const pageRefs = useRef([]);
    const autoScrollRef = useRef(null);
    const scrollAnimationRef = useRef(null);
    const imageCacheRef = useRef(new Map());
    const lastScrollTimeRef = useRef(Date.now());

    // Optimized image loading with caching
    const preloadImage = useCallback((url, index) => {
        return new Promise((resolve, reject) => {
            if (imageCacheRef.current.has(url)) {
                resolve(url);
                return;
            }

            const img = new Image();
            img.src = url;
            
            img.onload = () => {
                imageCacheRef.current.set(url, true);
                setLoadedImages(prev => new Set([...prev, index]));
                resolve(url);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                setImageLoadingErrors(prev => new Set([...prev, index]));
                reject(new Error(`Failed to load image ${index}`));
            };
            
            // Timeout for slow connections
            setTimeout(() => {
                if (!img.complete) {
                    console.warn(`Image ${index} loading timeout`);
                }
            }, 10000);
        });
    }, []);

    // Preload next images
    useEffect(() => {
        if (pages.length > 0 && currentPage < pages.length - 1) {
            const nextImages = pages.slice(currentPage + 1, Math.min(currentPage + 4, pages.length));
            nextImages.forEach((url, index) => {
                const actualIndex = currentPage + 1 + index;
                if (!loadedImages.has(actualIndex) && !imageLoadingErrors.has(actualIndex)) {
                    preloadImage(url, actualIndex).catch(() => {
                        // Handle error silently
                    });
                }
            });
        }
    }, [pages, currentPage, loadedImages, imageLoadingErrors, preloadImage]);

    const saveHistory = useCallback((comicData) => {
        try {
            const history = JSON.parse(localStorage.getItem('comicHistory')) || {};
            
            history[slug] = {
                title: comicData.comicTitle,
                image: comicDetailState?.comic?.image,
                lastChapter: comicData.chapterNumber,
                lastChapterLink: comicData.chapterLink,
                lastChapterSlug: chapterSlug,
                readDate: new Date().toISOString(),
                comicDataForDetail: comicDetailState,
            };
            localStorage.setItem('comicHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Error saving history to local storage", e);
        }
    }, [slug, chapterSlug, comicDetailState]);

    useEffect(() => {
        const fetchChapterPages = async () => {
            if (!chapterLink) {
                setError(new Error('No chapter link provided'));
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            setPages([]);
            setLoadedImages(new Set());
            setImageLoadingErrors(new Set());
            setNavigation({ previousChapter: null, nextChapter: null });
            window.scrollTo(0, 0);

            try {
                const response = await axios.get(`https://www.sankavollerei.com/comic/chapter${chapterLink}`, {
                    timeout: 15000,
                    headers: {
                        'Cache-Control': 'max-age=300'
                    }
                });
                
                const chapters = response.data.chapters || [];
                let images = response.data.images || [];
                const navData = response.data.navigation || { previousChapter: null, nextChapter: null };

                // Filter out invalid image URLs
                images = images.filter((url, index) => {
                    if (!url || url.includes('undefined') || url.includes('null')) {
                        console.warn(`Removed invalid image URL at index ${index}: ${url}`);
                        return false;
                    }
                    return true;
                });

                setPages(images);
                setCurrentChapters(chapters);
                setNavigation(navData);
                
                if (chapters.length > 0) {
                    const chapterIndex = chapters.findIndex(
                        ch => String(ch.chapter) === String(chapterNumber)
                    );
                    setCurrentChapterIndex(chapterIndex !== -1 ? chapterIndex : 0);
                } else {
                    setCurrentChapterIndex(0);
                }
                
                // Preload first few images
                const initialImages = images.slice(0, 3);
                Promise.allSettled(
                    initialImages.map((url, index) => preloadImage(url, index))
                ).then(() => {
                    setLoading(false);
                }).catch(() => {
                    setLoading(false);
                });

                saveHistory({ 
                    chapterLink, 
                    comicTitle, 
                    chapterNumber,
                });

            } catch (err) {
                console.error("Error fetching chapter pages:", err);
                setError(err);
                setLoading(false);
                // Fallback dengan placeholder images yang lebih baik
                const fallbackImages = Array.from({ length: 10 }, (_, i) => 
                    `https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=1200&q=80&${i}`
                );
                setPages(fallbackImages);
            }
        };

        fetchChapterPages();
        
        return () => {
            // Cleanup
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, [chapterLink, chapterNumber, comicTitle, saveHistory, preloadImage]);

    // Optimized scroll handler dengan throttling
    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTimeRef.current < 100) {
                // Skip terlalu sering update
                return;
            }
            lastScrollTimeRef.current = now;

            const container = isFullscreen ? comicContainerRef.current : document.documentElement;
            if (!container) return;

            const winScroll = container.scrollTop;
            const height = container.scrollHeight - container.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            
            setScrollProgress(scrolled);
            setScrollPosition(winScroll);
            
            // Update scroll direction
            if (winScroll > scrollPosition) {
                setScrollDirection('down');
            } else if (winScroll < scrollPosition) {
                setScrollDirection('up');
            }
            
            // Update current page based on scroll position
            if (pageRefs.current.length > 0) {
                const scrollPositionWithOffset = winScroll + (container.clientHeight * 0.3);
                for (let i = 0; i < pageRefs.current.length; i++) {
                    const page = pageRefs.current[i];
                    if (page && scrollPositionWithOffset >= page.offsetTop && 
                        scrollPositionWithOffset < page.offsetTop + page.offsetHeight) {
                        if (currentPage !== i) {
                            setCurrentPage(i);
                        }
                        break;
                    }
                }
            }
        };

        const scrollableElement = isFullscreen ? comicContainerRef.current : window;
        if (scrollableElement) {
            const throttledScroll = () => {
                if (scrollAnimationRef.current) {
                    cancelAnimationFrame(scrollAnimationRef.current);
                }
                scrollAnimationRef.current = requestAnimationFrame(handleScroll);
            };
            
            scrollableElement.addEventListener('scroll', throttledScroll, { passive: true });
            
            // Initial scroll position
            handleScroll();

            return () => {
                if (scrollableElement) {
                    scrollableElement.removeEventListener('scroll', throttledScroll);
                }
                if (scrollAnimationRef.current) {
                    cancelAnimationFrame(scrollAnimationRef.current);
                }
            };
        }
    }, [isFullscreen, scrollPosition, currentPage]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Smooth auto-scroll dengan requestAnimationFrame
    useEffect(() => {
        if (autoScrollSpeed > 0) {
            setIsAutoScrolling(true);
            let lastTime = 0;
            const scrollStep = 16; // ~60fps

            const smoothScroll = (currentTime) => {
                if (!lastTime) lastTime = currentTime;
                const deltaTime = currentTime - lastTime;
                
                if (deltaTime >= scrollStep) {
                    const container = isFullscreen ? comicContainerRef.current : window;
                    if (container) {
                        const scrollAmount = (autoScrollSpeed * deltaTime) / 1000;
                        container.scrollBy({ top: scrollAmount, behavior: 'instant' });
                        
                        // Check if we've reached the bottom
                        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
                        if (isAtBottom) {
                            // Auto go to next chapter if available
                            if (navigation.nextChapter) {
                                handleNextChapter();
                            } else {
                                setAutoScrollSpeed(0);
                            }
                        }
                    }
                    lastTime = currentTime;
                }
                
                if (autoScrollSpeed > 0) {
                    autoScrollRef.current = requestAnimationFrame(smoothScroll);
                }
            };

            autoScrollRef.current = requestAnimationFrame(smoothScroll);
        } else {
            setIsAutoScrolling(false);
            if (autoScrollRef.current) {
                cancelAnimationFrame(autoScrollRef.current);
                autoScrollRef.current = null;
            }
        }

        return () => {
            if (autoScrollRef.current) {
                cancelAnimationFrame(autoScrollRef.current);
                autoScrollRef.current = null;
            }
        };
    }, [autoScrollSpeed, isFullscreen, navigation.nextChapter]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            const elem = comicContainerRef.current;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    const handleBack = () => {
        navigate(`/detail-comic/${slug}`, {
            state: comicDetailState
        });
    };

    const handleNextChapter = useCallback(() => {
        const nextChapterSlug = navigation.nextChapter;
        if (nextChapterSlug) {
            const newChapterNumber = nextChapterSlug.split('-').pop(); 
            
            navigate(`/read-comic/${slug}/${nextChapterSlug}`, { 
                state: { 
                    chapterLink: nextChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState
                },
                replace: true
            });
        }
    }, [navigation.nextChapter, slug, comicTitle, comicDetailState, navigate]);

    const handlePrevChapter = useCallback(() => {
        const prevChapterSlug = navigation.previousChapter;
        if (prevChapterSlug) {
            const newChapterNumber = prevChapterSlug.split('-').pop(); 

            navigate(`/read-comic/${slug}/${prevChapterSlug}`, { 
                state: { 
                    chapterLink: prevChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState 
                },
                replace: true
            });
        }
    }, [navigation.previousChapter, slug, comicTitle, comicDetailState, navigate]);

    const handleImageLoad = useCallback((index) => {
        setLoadedImages(prev => new Set([...prev, index]));
        setIsLoadingPage(false);
    }, []);

    const handleImageError = useCallback((index, url) => {
        console.error(`Image load error at index ${index}: ${url}`);
        setImageLoadingErrors(prev => new Set([...prev, index]));
        setIsLoadingPage(false);
        
        // Coba retry atau ganti dengan fallback
        const retryCount = parseInt(localStorage.getItem(`retry_${index}`) || '0');
        if (retryCount < 3) {
            setTimeout(() => {
                localStorage.setItem(`retry_${index}`, (retryCount + 1).toString());
                const img = new Image();
                img.src = `${url}?retry=${retryCount + 1}`;
                img.onload = () => handleImageLoad(index);
                img.onerror = () => handleImageError(index, url);
            }, 1000 * (retryCount + 1));
        } else {
            // Ganti dengan placeholder
            const newPages = [...pages];
            newPages[index] = `https://placehold.co/800x1200/1e293b/ffffff?text=Page+${index + 1}&font=roboto`;
            setPages(newPages);
        }
    }, [pages, handleImageLoad]);

    const scrollToPage = useCallback((pageIndex) => {
        if (pageRefs.current[pageIndex]) {
            const offset = 20; // Small offset from top
            const elementPosition = pageRefs.current[pageIndex].offsetTop;
            const offsetPosition = elementPosition - offset;
            
            const container = isFullscreen ? comicContainerRef.current : window;
            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            setCurrentPage(pageIndex);
        }
    }, [isFullscreen]);

    const toggleAutoScroll = useCallback((speed) => {
        if (autoScrollSpeed === speed) {
            setAutoScrollSpeed(0);
            setIsAutoScrolling(false);
        } else {
            setAutoScrollSpeed(speed);
            setIsAutoScrolling(true);
        }
    }, [autoScrollSpeed]);

    const scrollToTop = useCallback(() => {
        const container = isFullscreen ? comicContainerRef.current : window;
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isFullscreen]);

    const scrollToBottom = useCallback(() => {
        const container = isFullscreen ? comicContainerRef.current : window;
        container.scrollTo({ 
            top: container.scrollHeight - container.clientHeight, 
            behavior: 'smooth' 
        });
    }, [isFullscreen]);

    const reloadChapter = useCallback(() => {
        setLoading(true);
        setPages([]);
        setLoadedImages(new Set());
        setImageLoadingErrors(new Set());
        
        // Simulate reload
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen flex flex-col justify-center items-center transition-colors fade-in">
                <div className="relative mb-6">
                    <div className="animate-spin-slow rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-500 animate-spin-slow" />
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg mb-2">Memuat Chapter...</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Chapter {chapterNumber}</p>
                <div className="mt-6 w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-shimmer"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
                <div className="flex justify-center items-center min-h-screen p-4">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center backdrop-blur-sm max-w-md fade-in">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h2>
                        <p className="text-red-300 mb-6">{error.message || 'Gagal memuat chapter'}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={reloadChapter}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faRedo} />
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasNext = !!navigation.nextChapter;
    const hasPrev = !!navigation.previousChapter;

    return (
        <div 
            ref={comicContainerRef} 
            className={`relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors scroll-smooth ${
                isFullscreen ? 'overflow-y-auto' : ''
            } ${isAutoScrolling ? 'cursor-none' : ''}`}
        >
            {/* Top Navigation Bar */}
            <div className={`fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
                isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-semibold group touch-target"
                            aria-label="Kembali ke detail komik"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">Kembali</span>
                        </button>

                        {/* Title */}
                        <div className="flex items-center gap-2 flex-1 justify-center mx-4 min-w-0">
                            <FontAwesomeIcon icon={faBookOpen} className="text-indigo-600 dark:text-indigo-400 hidden sm:inline flex-shrink-0" />
                            <div className="text-center truncate max-w-md">
                                <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {comicTitle}
                                </h2>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    Chapter <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{chapterNumber || 'Unknown'}</span>
                                    {pages.length > 0 && ` • Halaman ${currentPage + 1}/${pages.length}`}
                                </p>
                            </div>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Page Info */}
                            {pages.length > 0 && (
                                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                                    <span className="font-medium">{currentPage + 1}/{pages.length}</span>
                                </div>
                            )}

                            {/* Auto-scroll buttons */}
                            <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => toggleAutoScroll(50)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                        autoScrollSpeed === 50 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll lambat"
                                >
                                    Lambat
                                </button>
                                <button
                                    onClick={() => toggleAutoScroll(100)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                        autoScrollSpeed === 100 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll sedang"
                                >
                                    Sedang
                                </button>
                                <button
                                    onClick={() => toggleAutoScroll(200)}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                        autoScrollSpeed === 200 
                                            ? 'bg-indigo-600 text-white shadow-md' 
                                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll cepat"
                                >
                                    Cepat
                                </button>
                            </div>

                            {/* Fullscreen Toggle */}
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
                                title={isFullscreen ? "Keluar fullscreen" : "Masuk fullscreen"}
                                aria-label={isFullscreen ? "Keluar fullscreen" : "Masuk fullscreen"}
                            >
                                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="w-5 h-5" />
                            </button>

                            {/* Home Button */}
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
                                title="Ke beranda"
                                aria-label="Ke beranda"
                            >
                                <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-200 dark:bg-gray-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out"
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>

                {/* Auto-scroll indicator */}
                {autoScrollSpeed > 0 && (
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse">
                        <div className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                    </div>
                )}
            </div>

            {/* Comic Pages */}
            <div className={`pt-[68px] pb-32 ${isFullscreen ? 'pt-0 pb-0' : ''}`}>
                <div className="max-w-4xl mx-auto px-2 sm:px-4 fade-in">
                    {pages.map((page, index) => (
                        <div 
                            key={`page-${index}`} 
                            ref={el => {
                                if (el && !pageRefs.current[index]) {
                                    pageRefs.current[index] = el;
                                }
                            }}
                            className="relative mb-2 sm:mb-4 last:mb-0"
                            data-page={index + 1}
                        >
                            <div className="relative bg-gray-100 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                {(!loadedImages.has(index) && !imageLoadingErrors.has(index)) && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                                        <div className="text-center">
                                            <div className="animate-spin-slow rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto mb-3"></div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Memuat halaman {index + 1}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {imageLoadingErrors.has(index) ? (
                                    <div className="relative w-full min-h-[400px] sm:min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                                        <div className="text-center p-6">
                                            <div className="text-4xl mb-3">😢</div>
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">Gagal memuat gambar</p>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Halaman {index + 1}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={page}
                                        alt={`Halaman ${index + 1}`}
                                        width="800"
                                        height="1200"
                                        loading={index < 3 ? "eager" : "lazy"}
                                        decoding="async"
                                        className={`w-full h-auto object-contain block transition-all duration-500 ${
                                            loadedImages.has(index) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        }`}
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index, page)}
                                        style={{ 
                                            contentVisibility: 'auto',
                                            contain: 'layout style paint'
                                        }}
                                    />
                                )}
                            </div>
                            
                            {/* Page Number */}
                            <div className={`absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm transition-opacity duration-300 ${
                                isAutoScrolling ? 'opacity-50' : 'opacity-100'
                            }`}>
                                {index + 1}/{pages.length}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ${
                isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}>
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-4 gap-3 sm:gap-4">
                        {/* Previous Chapter Button */}
                        <button
                            onClick={handlePrevChapter}
                            disabled={!hasPrev}
                            className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 touch-target ${
                                hasPrev
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 active:scale-95'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            aria-label="Chapter sebelumnya"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </button>

                        {/* Middle Controls */}
                        <div className="flex items-center gap-3 sm:gap-4 order-first sm:order-none">
                            {/* Page Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 sm:p-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 touch-target transition-colors"
                                    aria-label="Halaman sebelumnya"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                                </button>
                                
                                <div className="text-center min-w-[90px] sm:min-w-[100px]">
                                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Halaman {currentPage + 1}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">dari {pages.length}</p>
                                </div>
                                
                                <button
                                    onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                                    disabled={currentPage === pages.length - 1}
                                    className="p-2 sm:p-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 touch-target transition-colors"
                                    aria-label="Halaman berikutnya"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Chapter List Toggle */}
                            <button
                                onClick={() => setShowChapterList(!showChapterList)}
                                className="p-2 sm:p-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 touch-target transition-colors"
                                title="Daftar chapter"
                                aria-label="Daftar chapter"
                            >
                                <FontAwesomeIcon icon={faList} className="w-4 h-4" />
                            </button>

                            {/* Auto-scroll toggle */}
                            <button
                                onClick={() => toggleAutoScroll(autoScrollSpeed === 0 ? 100 : 0)}
                                className={`p-2 sm:p-2.5 rounded-lg touch-target transition-colors ${
                                    autoScrollSpeed > 0
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500'
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                                title={autoScrollSpeed > 0 ? "Hentikan auto-scroll" : "Mulai auto-scroll"}
                                aria-label={autoScrollSpeed > 0 ? "Hentikan auto-scroll" : "Mulai auto-scroll"}
                            >
                                <FontAwesomeIcon icon={autoScrollSpeed > 0 ? faPause : faPlay} className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Next Chapter Button */}
                        <button
                            onClick={handleNextChapter}
                            disabled={!hasNext}
                            className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 touch-target ${
                                hasNext
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 active:scale-95'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            aria-label="Chapter berikutnya"
                        >
                            <span className="hidden sm:inline">Berikutnya</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    {/* Chapter List Dropdown */}
                    {showChapterList && currentChapters.length > 0 && (
                        <div className="absolute bottom-full left-2 right-2 sm:left-auto sm:right-auto mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto p-3 z-50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Pilih Chapter</h4>
                                <button
                                    onClick={() => setShowChapterList(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    aria-label="Tutup daftar chapter"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {currentChapters.map((chapter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const newChapterNumber = String(chapter.chapter);
                                            navigate(`/read-comic/${slug}/chapter-${newChapterNumber}`, {
                                                state: {
                                                    chapterLink: chapter.link,
                                                    comicTitle: comicTitle,
                                                    chapterNumber: newChapterNumber,
                                                    comicDetailState: comicDetailState
                                                }
                                            });
                                            setShowChapterList(false);
                                        }}
                                        className={`p-2 rounded text-center text-sm font-medium transition-all touch-target ${
                                            String(chapter.chapter) === String(chapterNumber)
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105'
                                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105'
                                        }`}
                                        aria-label={`Chapter ${chapter.chapter}`}
                                    >
                                        Ch. {chapter.chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Quick Controls for Mobile */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40 md:hidden">
                {/* Scroll to top/bottom */}
                <button
                    onClick={scrollToTop}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all touch-target"
                    title="Ke atas"
                    aria-label="Ke atas"
                >
                    <FontAwesomeIcon icon={faAngleDoubleUp} className="w-5 h-5" />
                </button>
                <button
                    onClick={scrollToBottom}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all touch-target"
                    title="Ke bawah"
                    aria-label="Ke bawah"
                >
                    <FontAwesomeIcon icon={faAngleDoubleDown} className="w-5 h-5" />
                </button>
                
                {/* Page navigation */}
                <button
                    onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Halaman sebelumnya"
                    aria-label="Halaman sebelumnya"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                </button>
                <button
                    onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                    disabled={currentPage === pages.length - 1}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Halaman berikutnya"
                    aria-label="Halaman berikutnya"
                >
                    <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                </button>
                
                {/* Menu button */}
                <button
                    onClick={() => setShowChapterList(!showChapterList)}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all touch-target"
                    title="Menu"
                    aria-label="Menu"
                >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                </button>
            </div>

            {/* Auto-scroll status indicator */}
            {isAutoScrolling && (
                <div className="fixed top-20 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg z-40 animate-bounce-slow">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold">Auto-scroll: {autoScrollSpeed}px/s</span>
                    </div>
                </div>
            )}

            {/* Loading progress */}
            {pages.length > 0 && loadedImages.size < pages.length && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full shadow-lg z-40 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">
                            Memuat {loadedImages.size} dari {pages.length} halaman
                        </span>
                    </div>
                    <div className="mt-1 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${(loadedImages.size / pages.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadComic;
