import React, { useState } from 'react'
import CardNewComic from '../components/Home/CardNewComic'
import SEO from '../components/SEO'

const PustakaPage = () => {
    const [currentPage, setCurrentPage] = useState(1)
    
    return (
        <>
            <SEO
                title="Pustaka Komik - Koleksi Lengkap"
                description="Jelajahi koleksi lengkap pustaka komik dengan ribuan judul menarik. Baca komik online gratis di Kanata-Toon."
                keywords="pustaka komik, koleksi komik, komik lengkap, manga koleksi"
                url="https://juju-manhwa-2-0.vercel.app/pustaka"
            />
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
                {/* Background decorative elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 pt-8 fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <div className="text-center mb-8 fade-in">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Pustaka Komik
                                </span>
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                                Jelajahi ribuan komik menarik dari berbagai genre. Update setiap hari!
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 fade-in">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Komik</div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">50+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Genre</div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Daily</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Update</div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Free</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Baca</div>
                            </div>
                        </div>

                        {/* Comic Grid */}
                        <CardNewComic
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />

                        {/* Info Section */}
                        <div className="mt-12 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20 fade-in">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                📚 Tips Membaca di Pustaka
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">1. Gunakan Filter</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Gunakan pagination untuk menjelajahi semua komik</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <div className="font-semibold text-green-600 dark:text-green-400 mb-2">2. Simpan Riwayat</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Komik yang dibaca otomatis tersimpan di riwayat</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <div className="font-semibold text-purple-600 dark:text-purple-400 mb-2">3. Update Rutin</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Komik baru ditambahkan setiap hari</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PustakaPage