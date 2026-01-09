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
    faPlay,
    faPause,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faRedo
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
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(0);
    
    const comicContainerRef = useRef(null);
    const imageContainerRef = useRef(null);
    const autoScrollRef = useRef(null);
    const scrollAnimationRef = useRef(null);
    const imageCacheRef = useRef(new Map());
    const lastScrollTimeRef = useRef(Date.now());

    // Preload semua gambar sekaligus untuk menghindari putus-putus
    const preloadAllImages = useCallback(async (imageUrls) => {
        const promises = imageUrls.map((url, index) => {
            return new Promise((resolve, reject) => {
                if (imageCacheRef.current.has(url)) {
                    resolve(index);
                    return;
                }

                const img = new Image();
                img.src = url;
                
                img.onload = () => {
                    imageCacheRef.current.set(url, true);
                    setLoadedImages(prev => new Set([...prev, index]));
                    resolve(index);
                };
                
                img.onerror = () => {
                    console.warn(`Failed to load image ${index}: ${url}`);
                    // Tetap resolve untuk melanjutkan preload lainnya
                    resolve(index);
                };
            });
        });

        await Promise.allSettled(promises);
    }, []);

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
            window.scrollTo(0, 0);

            try {
                const response = await axios.get(`https://www.sankavollerei.com/comic/chapter${chapterLink}`, {
                    timeout: 20000,
                    headers: {
                        'Cache-Control': 'max-age=3600'
                    }
                });
                
                const chapters = response.data.chapters || [];
                let images = response.data.images || [];
                const navData = response.data.navigation || { previousChapter: null, nextChapter: null };

                // Filter dan validasi URL gambar
                images = images.filter((url, index) => {
                    if (!url || url.includes('undefined') || url.includes('null') || !url.startsWith('http')) {
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

                // Preload SEMUA gambar sekaligus
                await preloadAllImages(images);
                
                setLoading(false);

                saveHistory({ 
                    chapterLink, 
                    comicTitle, 
                    chapterNumber,
                });

            } catch (err) {
                console.error("Error fetching chapter pages:", err);
                setError(err);
                setLoading(false);
                // Fallback dengan gambar dari Unsplash yang konsisten
                const fallbackImages = Array.from({ length: 15 }, (_, i) => 
                    `https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=1200&q=80&crop=center&${i}`
                );
                setPages(fallbackImages);
                await preloadAllImages(fallbackImages);
                setLoading(false);
            }
        };

        fetchChapterPages();
        
        return () => {
            // Cleanup
            if (autoScrollRef.current) {
                cancelAnimationFrame(autoScrollRef.current);
            }
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, [chapterLink, chapterNumber, comicTitle, saveHistory, preloadAllImages]);

    // Optimized scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTimeRef.current < 100) return;
            lastScrollTimeRef.current = now;

            const container = isFullscreen ? comicContainerRef.current : document.documentElement;
            if (!container) return;

            const winScroll = container.scrollTop;
            const height = container.scrollHeight - container.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            
            setScrollProgress(scrolled);
            
            // Hitung halaman saat ini berdasarkan scroll position
            if (pages.length > 0) {
                const pageHeight = container.scrollHeight / pages.length;
                const currentPageIndex = Math.floor(winScroll / pageHeight);
                if (currentPage !== currentPageIndex && currentPageIndex >= 0 && currentPageIndex < pages.length) {
                    setCurrentPage(currentPageIndex);
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
    }, [isFullscreen, pages.length, currentPage]);

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

    // Smooth auto-scroll
    useEffect(() => {
        if (autoScrollSpeed > 0) {
            setIsAutoScrolling(true);
            let lastTime = 0;
            const scrollStep = 16;

            const smoothScroll = (currentTime) => {
                if (!lastTime) lastTime = currentTime;
                const deltaTime = currentTime - lastTime;
                
                if (deltaTime >= scrollStep) {
                    const container = isFullscreen ? comicContainerRef.current : window;
                    if (container) {
                        const scrollAmount = (autoScrollSpeed * deltaTime) / 1000;
                        container.scrollBy({ top: scrollAmount });
                        
                        // Auto lanjut ke chapter berikutnya
                        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
                        if (isAtBottom && navigation.nextChapter) {
                            handleNextChapter();
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
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, []);

    const toggleAutoScroll = useCallback((speed) => {
        if (autoScrollSpeed === speed) {
            setAutoScrollSpeed(0);
        } else {
            setAutoScrollSpeed(speed);
        }
    }, [autoScrollSpeed]);

    if (loading) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen flex flex-col justify-center items-center transition-colors">
                <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-500 animate-spin" />
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg mb-2">Memuat Chapter...</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Chapter {chapterNumber}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
                <div className="flex justify-center items-center min-h-screen p-4">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center backdrop-blur-sm max-w-md">
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
            {/* SIMPLIFIED Top Navigation Bar - Hanya muncul di non-fullscreen */}
            {!isFullscreen && (
                <div className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-14">
                            {/* Back Button */}
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-semibold group"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
                                <span className="hidden sm:inline">Kembali</span>
                            </button>

                            {/* Title */}
                            <div className="flex items-center gap-2 flex-1 justify-center mx-4 min-w-0">
                                <div className="text-center truncate max-w-md">
                                    <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                                        {comicTitle}
                                    </h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Chapter {chapterNumber} • Halaman {currentPage + 1}/{pages.length}
                                    </p>
                                </div>
                            </div>

                            {/* Minimal Controls */}
                            <div className="flex items-center gap-2">
                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Fullscreen"
                                >
                                    <FontAwesomeIcon icon={faExpand} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-200 dark:bg-gray-800">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Comic Images Container - SEMUA GAMBAR DALAM SATU KONTINU */}
            <div 
                ref={imageContainerRef}
                className={`${isFullscreen ? 'pt-0' : 'pt-[56px]'} pb-20`}
            >
                <div className="max-w-4xl mx-auto">
                    {/* Single continuous container for all images */}
                    <div className="space-y-0">
                        {pages.map((page, index) => (
                            <div 
                                key={`page-${index}`}
                                className="relative"
                                data-page={index + 1}
                            >
                                {/* Image tanpa margin/padding - langsung menyatu */}
                                <img
                                    src={page}
                                    alt={`Halaman ${index + 1}`}
                                    width="800"
                                    height="1200"
                                    loading="eager" // Semua eager karena sudah di-preload
                                    decoding="async"
                                    className={`w-full h-auto object-contain block transition-opacity duration-500 ${
                                        loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{
                                        display: 'block',
                                        margin: 0,
                                        padding: 0,
                                        border: 'none'
                                    }}
                                />
                                
                                {/* Page indicator overlay - hanya muncul di hover */}
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    {index + 1}/{pages.length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SIMPLIFIED Bottom Controls - Minimal dan non-intrusive */}
            <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-sm z-40 transition-all duration-300 ${
                isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}>
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-between items-center py-3">
                        {/* Left: Chapter Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevChapter}
                                disabled={!hasPrev}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    hasPrev
                                        ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </button>
                        </div>

                        {/* Center: Current Page Info */}
                        <div className="text-center">
                            <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                                <span className="font-semibold">{currentPage + 1}</span>
                                <span className="mx-2">/</span>
                                <span>{pages.length}</span>
                            </div>
                        </div>

                        {/* Right: Next Chapter */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNextChapter}
                                disabled={!hasNext}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    hasNext
                                        ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <span className="hidden sm:inline">Berikutnya</span>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Auto-scroll Controls - Minimal */}
            <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-40">
                {/* Auto-scroll Toggle */}
                <button
                    onClick={() => toggleAutoScroll(autoScrollSpeed === 0 ? 100 : 0)}
                    className={`p-3 rounded-full shadow-lg transition-all ${
                        autoScrollSpeed > 0
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
                    }`}
                    title={autoScrollSpeed > 0 ? "Hentikan Auto-scroll" : "Mulai Auto-scroll"}
                >
                    <FontAwesomeIcon icon={autoScrollSpeed > 0 ? faPause : faPlay} className="w-5 h-5" />
                </button>

                {/* Scroll to Top/Bottom */}
                <button
                    onClick={scrollToTop}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
                    title="Ke Atas"
                >
                    <FontAwesomeIcon icon={faAngleDoubleUp} className="w-5 h-5" />
                </button>
                <button
                    onClick={scrollToBottom}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
                    title="Ke Bawah"
                >
                    <FontAwesomeIcon icon={faAngleDoubleDown} className="w-5 h-5" />
                </button>
            </div>

            {/* Auto-scroll Speed Selector - Muncul saat auto-scroll aktif */}
            {autoScrollSpeed > 0 && (
                <div className="fixed top-20 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg z-40 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold">Auto-scroll</span>
                        </div>
                        <div className="flex gap-1">
                            {[50, 100, 200].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => toggleAutoScroll(speed)}
                                    className={`px-2 py-1 rounded text-xs ${
                                        autoScrollSpeed === speed
                                            ? 'bg-white/20'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    {speed}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen-only minimal controls */}
            {isFullscreen && (
                <>
                    {/* Top-left back button in fullscreen */}
                    <button
                        onClick={handleBack}
                        className="fixed top-4 left-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-40 opacity-0 hover:opacity-100"
                        title="Kembali"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
                    </button>

                    {/* Top-right exit fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="fixed top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-40 opacity-0 hover:opacity-100"
                        title="Keluar Fullscreen"
                    >
                        <FontAwesomeIcon icon={faCompress} className="w-5 h-5" />
                    </button>

                    {/* Current page indicator in fullscreen */}
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm z-40 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="font-semibold">{currentPage + 1}</span>
                        <span className="mx-2">/</span>
                        <span>{pages.length}</span>
                    </div>
                </>
            )}

            {/* Loading progress indicator - hanya muncul saat loading */}
            {loadedImages.size < pages.length && pages.length > 0 && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm z-40">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">
                            {Math.round((loadedImages.size / pages.length) * 100)}% Loaded
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadComic;
