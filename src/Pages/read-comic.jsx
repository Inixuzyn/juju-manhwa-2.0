import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const ReadComic = () => {
    const navigate = useNavigate()
    const { slug, chapterSlug } = useParams()
    const location = useLocation()
    
    const { 
        chapterLink, 
        comicTitle, 
        chapterNumber,
        comicDetailState
    } = location.state || {}
    
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [currentChapters, setCurrentChapters] = useState([])
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
    const [navigation, setNavigation] = useState({
        previousChapter: null,
        nextChapter: null,
    })

    useEffect(() => {
        const fetchChapterPages = async () => {
            if (!chapterLink) {
                setError(new Error('No chapter link provided'))
                setLoading(false)
                return
            }
            setLoading(true)
            setError(null)
            setPages([])
            setNavigation({ previousChapter: null, nextChapter: null })
            window.scrollTo(0, 0) 

            try {
            const response = await axios.get(`https://www.sankavollerei.com/comic/chapter/${chapterLink}`)
            
          //  console.log("Fetched chapter pages:", response.data)

            const chapters = response.data.chapters || []
            const images = response.data.images || []
            const navData = response.data.navigation || { previousChapter: null, nextChapter: null }

            setPages(images)
            setCurrentChapters(chapters)
            setNavigation(navData)
                
            if (chapters.length > 0) {
                const chapterIndex = chapters.findIndex(
                    ch => String(ch.chapter) === String(chapterNumber)
                )

                setCurrentChapterIndex(chapterIndex !== -1 ? chapterIndex : 0)
            } else {
                setCurrentChapterIndex(0)
            }
                
            setLoading(false)
        } catch (err) {
            setError(err)
            setLoading(false)
            setPages([
                'https://picsum.photos/800/1200?random=1',
                'https://picsum.photos/800/1200?random=2',
                'https://picsum.photos/800/1200?random=3',
                'https://picsum.photos/800/1200?random=4'
            ])
        }
    }

    fetchChapterPages()
}, [chapterLink])

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0
            setScrollProgress(scrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleBack = () => {
        navigate(`/detail-comic/${slug}`, {
            state: comicDetailState
        })
    }

    const handleNextChapter = () => {
        const nextChapterSlug = navigation.nextChapter
        if (nextChapterSlug) {
            const newChapterNumber = nextChapterSlug.split('-').pop() 
            
            navigate(`/read-comic/${slug}/${nextChapterSlug}`, { 
                state: { 
                    chapterLink: nextChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState
                } 
            })
        }
    }

    const handlePrevChapter = () => {
        const prevChapterSlug = navigation.previousChapter
        if (prevChapterSlug) {
            const newChapterNumber = prevChapterSlug.split('-').pop() 

            navigate(`/read-comic/${slug}/${prevChapterSlug}`, { 
                state: { 
                    chapterLink: prevChapterSlug, 
                    comicTitle: comicTitle, 
                    chapterNumber: newChapterNumber,
                    comicDetailState: comicDetailState 
                } 
            })
        }
    }

    if (loading) {
        return (
            <div className="bg-[#121212] flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <h2>Terjadi Kesalahan</h2>
                <p>{error.message}</p>
            </div>
        )
    }

    const hasNext = !!navigation.nextChapter
    const hasPrev = !!navigation.previousChapter

    return (
        <div className="bg-[#121212] min-h-screen">
            {/* Header Fixed */}
            <div className="fixed top-0 left-0 right-0 bg-[#1e1e1e] shadow-lg py-4 px-6 z-20 flex justify-between items-center border-b border-gray-700">
                <button 
                    onClick={handleBack}
                    className="text-gray-400 hover:text-white"
                >
                    ← Kembali
                </button>
                <h2 className="text-sm md:text-lg font-bold text-center truncate max-w-[50%] text-white">
                    {comicTitle} - Chapter {chapterNumber || 'Unknown'}
                </h2>
                <div className="w-10"></div>
            </div>

            {/* Progress Bar */}
            <div 
                className="fixed top-16 left-0 right-0 h-1 bg-gray-700 z-20"
                style={{ zIndex: 30 }}
            >
                <div 
                    className="bg-indigo-500 h-full" 
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>


            {/* Konten Komik */}
            <div className="container mx-auto pt-20 pb-20"> 
                {pages.map((page, index) => (
                    <img 
                        key={index} 
                        src={page} 
                        alt={`Halaman ${index + 1}`}
                        className="max-w-full h-auto object-contain block mx-auto"
                        loading="lazy"
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#1e1e1e] shadow-lg py-2 px-2 z-20 flex justify-between items-center border-t border-gray-700">
            
            {/* Previous Chapter Button */}
                <button 
                    onClick={handlePrevChapter}
                    disabled={!hasPrev}
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                        hasPrev 
                            ? 'bg-indigo-700 text-white hover:bg-indigo-600' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    &larr; Prev Chapter
                </button>
                
                <span className="text-sm text-gray-400 hidden sm:inline">
                    Akhir Chapter
                </span>

            {/* Next Chapter Button */}
                <button 
                    onClick={handleNextChapter}
                    disabled={!hasNext}
                    className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                        hasNext 
                            ? 'bg-indigo-700 text-white hover:bg-indigo-600' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Next Chapter &rarr;
                </button>
            </div>
        </div>
    )
}

export default ReadComic