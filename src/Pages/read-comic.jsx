import React, { useState, useEffect, useRef } from 'react';
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
    faDownload
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
    
    const comicContainerRef = useRef(null);
    const pageRefs = useRef([]);
    const autoScrollRef = useRef(null);

    const saveHistory = (comicData) => {
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
    };

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
            setNavigation({ previousChapter: null, nextChapter: null });
            window.scrollTo(0, 0); 

            try {
                const response = await axios.get(`https://www.sankavollerei.com/comic/chapter${chapterLink}`);
                
                const chapters = response.data.chapters || [];
                const images = response.data.images || [];
                const navData = response.data.navigation || { previousChapter: null, nextChapter: null };

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
                
                setLoading(false);

                saveHistory({ 
                    chapterLink, 
                    comicTitle, 
                    chapterNumber,
                });

            } catch (err) {
                setError(err);
                setLoading(false);
                // Fallback images for demo
                setPages([
                    'https://picsum.photos/800/1200?random=1',
                    'https://picsum.photos/800/1200?random=2',
                    'https://picsum.photos/800/1200?random=3',
                    'https://picsum.photos/800/1200?random=4'
                ]);
            }
        };

        fetchChapterPages();
    }, [chapterLink, chapterNumber]);

    useEffect(() => {
        const handleScroll = () => {
            const container = isFullscreen ? comicContainerRef.current : document.documentElement;
            if (!container) return;

            const winScroll = container.scrollTop;
            const height = container.scrollHeight - container.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            setScrollProgress(scrolled);
            
            // Update current page based on scroll position
            if (pageRefs.current.length > 0) {
                const scrollPosition = container.scrollTop + 100;
                for (let i = 0; i < pageRefs.current.length; i++) {
                    const page = pageRefs.current[i];
                    if (page && scrollPosition >= page.offsetTop && scrollPosition < page.offsetTop + page.offsetHeight) {
                        setCurrentPage(i);
                        break;
                    }
                }
            }
        };

        const scrollableElement = isFullscreen ? comicContainerRef.current : window;
        if (scrollableElement) {
            scrollableElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollableElement) {
                scrollableElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Auto-scroll effect
    useEffect(() => {
        if (autoScrollSpeed > 0) {
            autoScrollRef.current = setInterval(() => {
                const container = isFullscreen ? comicContainerRef.current : window;
                if (container) {
                    container.scrollBy({ top: autoScrollSpeed, behavior: 'smooth' });
                }
            }, 100);
        } else {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
                autoScrollRef.current = null;
            }
        }

        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        };
    }, [autoScrollSpeed, isFullscreen]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            comicContainerRef.current.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleBack = () => {
        navigate(`/detail-comic/${slug}`, {
            state: comicDetailState
        });
    };

    const handleNextChapter = () => {
        const nextChapterSlug = navigation.nextChapter;
        if (nextChapterSlug) {
            const newChapterNumber = nextChapterSlug.split('-').pop(); 
            
            navigate(`/read-comic/${slug}/${nextChapterSlug}`, { 
                state: { 
                    chapterLink: nextChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState
                } 
            });
        }
    };

    const handlePrevChapter = () => {
        const prevChapterSlug = navigation.previousChapter;
        if (prevChapterSlug) {
            const newChapterNumber = prevChapterSlug.split('-').pop(); 

            navigate(`/read-comic/${slug}/${prevChapterSlug}`, { 
                state: { 
                    chapterLink: prevChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState 
                } 
            });
        }
    };

    const handleImageLoad = () => {
        setIsLoadingPage(false);
    };

    const handleImageError = (index) => {
        setIsLoadingPage(false);
        // Replace with placeholder
        const newPages = [...pages];
        newPages[index] = 'https://via.placeholder.com/800x1200/1e293b/ffffff?text=Gagal+Memuat+Gambar';
        setPages(newPages);
    };

    const scrollToPage = (pageIndex) => {
        if (pageRefs.current[pageIndex]) {
            pageRefs.current[pageIndex].scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleAutoScroll = (speed) => {
        if (autoScrollSpeed === speed) {
            setAutoScrollSpeed(0);
        } else {
            setAutoScrollSpeed(speed);
        }
    };

    if (loading) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen flex flex-col justify-center items-center transition-colors fade-in">
                <div className="relative mb-4">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-indigo-500 animate-spin" />
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Memuat Chapter...</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Chapter {chapterNumber}</p>
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
                        <p className="text-red-300 mb-6">{error.message}</p>
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
                        >
                            Kembali
                        </button>
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
            className={`relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors ${isFullscreen ? 'overflow-y-auto' : ''}`}
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
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors font-semibold group"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">Kembali</span>
                        </button>

                        {/* Title */}
                        <div className="flex items-center gap-2 flex-1 justify-center mx-4">
                            <FontAwesomeIcon icon={faBookOpen} className="text-indigo-600 dark:text-indigo-400 hidden sm:inline" />
                            <div className="text-center truncate max-w-md">
                                <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {comicTitle}
                                </h2>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Chapter <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{chapterNumber || 'Unknown'}</span>
                                    {pages.length > 0 && ` • Halaman ${currentPage + 1}/${pages.length}`}
                                </p>
                            </div>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex items-center gap-3">
                            {/* Page Info */}
                            {pages.length > 0 && (
                                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                                    <span>{currentPage + 1}/{pages.length}</span>
                                </div>
                            )}

                            {/* Auto-scroll buttons */}
                            <div className="hidden md:flex items-center gap-1">
                                <button
                                    onClick={() => toggleAutoScroll(50)}
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                        autoScrollSpeed === 50 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll slow"
                                >
                                    Slow
                                </button>
                                <button
                                    onClick={() => toggleAutoScroll(100)}
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                        autoScrollSpeed === 100 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll medium"
                                >
                                    Med
                                </button>
                                <button
                                    onClick={() => toggleAutoScroll(200)}
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                        autoScrollSpeed === 200 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                    title="Auto-scroll fast"
                                >
                                    Fast
                                </button>
                            </div>

                            {/* Fullscreen Toggle */}
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                            </button>

                            {/* Home Button */}
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Go to home"
                            >
                                <FontAwesomeIcon icon={faHome} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150"
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
                <div className="max-w-4xl mx-auto px-4 fade-in">
                    {pages.map((page, index) => (
                        <div 
                            key={index} 
                            ref={el => pageRefs.current[index] = el}
                            className="relative mb-4 last:mb-0"
                        >
                            <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                {isLoadingPage && index === currentPage && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                                    </div>
                                )}
                                <img
                                    src={page}
                                    alt={`Halaman ${index + 1}`}
                                    width="800"
                                    height="1200"
                                    loading={index < 2 ? "eager" : "lazy"}
                                    decoding="async"
                                    className={`w-full h-auto object-contain block transition-opacity duration-300 ${
                                        isLoadingPage && index === currentPage ? 'opacity-50' : 'opacity-100'
                                    }`}
                                    onLoad={() => index === currentPage && handleImageLoad()}
                                    onError={() => handleImageError(index)}
                                />
                            </div>
                            
                            {/* Page Number */}
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                        {/* Previous Chapter Button */}
                        <button
                            onClick={handlePrevChapter}
                            disabled={!hasPrev}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                hasPrev
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* Middle Controls */}
                        <div className="flex items-center gap-4">
                            {/* Page Navigation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                
                                <div className="text-center min-w-[100px]">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">Halaman {currentPage + 1}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">dari {pages.length}</p>
                                </div>
                                
                                <button
                                    onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                                    disabled={currentPage === pages.length - 1}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>

                            {/* Chapter List Toggle */}
                            <button
                                onClick={() => setShowChapterList(!showChapterList)}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                                title="Show chapter list"
                            >
                                <FontAwesomeIcon icon={faList} />
                            </button>
                        </div>

                        {/* Next Chapter Button */}
                        <button
                            onClick={handleNextChapter}
                            disabled={!hasNext}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                hasNext
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            <span className="hidden sm:inline">Next</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    {/* Chapter List Dropdown */}
                    {showChapterList && currentChapters.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto p-2">
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
                                        className={`p-2 rounded text-center text-sm font-medium transition-all ${
                                            String(chapter.chapter) === String(chapterNumber)
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Ch. {chapter.chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Controls for Mobile */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40 md:hidden">
                <button
                    onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                    onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                    disabled={currentPage === pages.length - 1}
                    className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
};

export default ReadComic;