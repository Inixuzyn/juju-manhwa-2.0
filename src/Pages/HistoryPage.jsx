import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faHistory, faPlay, faClock, faBookOpen, faArrowRight, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import SEO from '../components/SEO'

const HistoryPage = () => {
    const [historyList, setHistoryList] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedHistory, setSelectedHistory] = useState(null)
    
    const navigate = useNavigate()

    useEffect(() => {
        loadHistory()
        // Simulate loading
        setTimeout(() => setLoading(false), 500)
    }, [])

    const loadHistory = () => {
        try {
            const storedHistory = localStorage.getItem('comicHistory')
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory)
                const sortedHistory = Object.entries(parsedHistory)
                    .map(([slug, data]) => ({ slug, ...data }))
                    .sort((a, b) => new Date(b.readDate) - new Date(a.readDate))
                
                setHistoryList(sortedHistory)
            }
        } catch (e) {
            console.error("Gagal memuat riwayat", e)
        }
    }

    const clearHistory = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat bacaan?')) {
            localStorage.removeItem('comicHistory')
            setHistoryList([])
        }
    }

    const clearSingleHistory = (slug, e) => {
        e.stopPropagation()
        if (window.confirm('Hapus komik ini dari riwayat?')) {
            try {
                const storedHistory = JSON.parse(localStorage.getItem('comicHistory') || '{}')
                delete storedHistory[slug]
                localStorage.setItem('comicHistory', JSON.stringify(storedHistory))
                loadHistory()
            } catch (e) {
                console.error("Error deleting history", e)
            }
        }
    }

    const handleComicClick = (item) => {
        navigate(`/detail-comic/${item.slug}`, {
            state: item.comicDataForDetail
        })
    }

    const handleContinueReading = (e, item) => {
        e.stopPropagation() 
        navigate(`/read-comic/${item.slug}/${item.lastChapterSlug}`, {
            state: {
                chapterLink: item.lastChapterLink,
                comicTitle: item.title,
                chapterNumber: item.lastChapter,
                comicDetailState: item.comicDataForDetail
            }
        })
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) {
            return `${diffMins} menit yang lalu`
        } else if (diffHours < 24) {
            return `${diffHours} jam yang lalu`
        } else if (diffDays < 7) {
            return `${diffDays} hari yang lalu`
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        }
    }

    if (loading) {
        return (
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen transition-colors">
                <div className="flex justify-center items-center min-h-screen p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Memuat riwayat...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <SEO
                title="Riwayat Bacaan"
                description="Daftar komik yang pernah Anda baca di Kanata-Toon. Lanjutkan membaca dari chapter terakhir."
                url="https://juju-manhwa-2-0.vercel.app/history"
            />
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                                    <FontAwesomeIcon icon={faHistory} className="text-purple-500" />
                                    Riwayat Bacaan
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    {historyList.length} komik dibaca
                                </p>
                            </div>
                        </div>
                        
                        {historyList.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={clearHistory}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Hapus Semua
                                </button>
                            </div>
                        )}
                    </div>

                    {historyList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 fade-in">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faBookOpen} className="text-5xl text-purple-500/50" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Belum ada riwayat</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
                                Anda belum membaca komik apapun. Mulailah membaca untuk menyimpan riwayat Anda di sini.
                            </p>
                            <button
                                onClick={() => navigate('/pustaka')}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                            >
                                Mulai Membaca
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* History Stats */}
                            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-purple-500/20">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Statistik Bacaan</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Total {historyList.length} komik • Terakhir dibaca {formatDate(historyList[0]?.readDate)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {historyList.length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Komik</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {Math.max(...historyList.map(h => parseInt(h.lastChapter) || 0))}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Chapter Tertinggi</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {historyList.map((item, index) => (
                                    <div
                                        key={`${item.slug}-${index}`}
                                        onClick={() => handleComicClick(item)}
                                        onMouseEnter={() => setSelectedHistory(index)}
                                        onMouseLeave={() => setSelectedHistory(null)}
                                        className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                                            selectedHistory === index
                                                ? 'border-purple-500/50 shadow-xl shadow-purple-500/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-500/30'
                                        }`}
                                    >
                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => clearSingleHistory(item.slug, e)}
                                            className={`absolute top-3 right-3 z-10 p-2 bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg transition-all duration-300 ${
                                                selectedHistory === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            } hover:bg-red-500/20`}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                        </button>

                                        <div className="flex p-4">
                                            <div className="w-28 h-40 flex-shrink-0 relative overflow-hidden rounded-xl">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/150x225/1e293b/ffffff?text=No+Cover'
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>

                                            <div className="flex-1 pl-4 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faBookOpen} className="text-xs text-gray-400" />
                                                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                                Chapter {item.lastChapter}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faClock} className="text-xs text-gray-400" />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(item.readDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => handleContinueReading(e, item)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all group/btn"
                                                    >
                                                        <FontAwesomeIcon icon={faPlay} className="text-[10px] transition-transform group-hover/btn:scale-110" />
                                                        Lanjut Baca
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress indicator */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                                            <div 
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                                style={{ width: `${Math.min(parseInt(item.lastChapter) * 5, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty History Warning */}
                            {historyList.length < 3 && (
                                <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-2xl p-6 backdrop-blur-sm border border-yellow-500/20 mt-6 fade-in">
                                    <div className="flex items-start gap-3">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400 text-xl mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                Yuk, Baca Lebih Banyak!
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Riwayat bacaan Anda masih sedikit. Baca lebih banyak komik untuk mengisi riwayat dan mendapatkan rekomendasi yang lebih personal.
                                            </p>
                                            <button
                                                onClick={() => navigate('/pustaka')}
                                                className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all"
                                            >
                                                Jelajahi Komik
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default HistoryPage