import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faFire, faNewspaper, faInfinity, faArrowRight, faStar, faUsers, faBookReader } from '@fortawesome/free-solid-svg-icons'
import SearchComic from '../components/Home/SearchComic'
import CardTerbaruComic from '../components/Home/CardTerbaruComic'
import CardTrendingComic from '../components/Home/CardTrendingComic'
import SEO from '../components/SEO'

const Home = () => {
  const [stats, setStats] = useState({
    comics: 1000,
    updates: 50,
    readers: 50000,
    rating: 4.8
  })
  
  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        comics: 1250,
        updates: 75,
        readers: 75000,
        rating: 4.9
      })
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
      <SEO
        title="Kanata-Toon - Baca Komik Gratis Bahasa Indonesia Terbaru"
        description="Baca komik online gratis di Kanata-Toon. Koleksi lengkap komik terbaru, trending, dan populer dalam bahasa Indonesia. Update setiap hari!"
        keywords="komik indonesia, baca komik gratis, komik online, manga indonesia, manhwa indonesia"
        url="https://juju-manhwa-2-0.vercel.app/"
      />
      <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] min-h-screen text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section with Search */}
        <div className="pt-8 pb-4 fade-in">
          <SearchComic />
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{stats.comics}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Komik</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.updates}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Update Harian</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{stats.readers}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pembaca</div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{stats.rating}/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
            </div>
          </div>
        </div>

        {/* Terbaru Section */}
        <div className="pb-6 fade-in">
          <CardTerbaruComic />
        </div>

        {/* Trending Section */}
        <div className="pb-6 fade-in">
          <CardTrendingComic />
        </div>

        {/* Quick Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Jelajahi Semua Koleksi
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Temukan ribuan komik menarik di berbagai kategori
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              to="/pustaka"
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faBookOpen} className="text-2xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-center">
                    Pustaka Komik
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Koleksi lengkap komik terbaru
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/terbaru"
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faNewspaper} className="text-2xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-center">
                    Update Terbaru
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Komik yang baru diupdate
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/trending"
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faFire} className="text-2xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-center">
                    Trending
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Komik paling populer
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/unlimited"
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faInfinity} className="text-2xl text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent text-center">
                    Unlimited
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Koleksi tanpa batas
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl p-8 text-center backdrop-blur-sm border border-indigo-500/20 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Siap Membaca Komik Favoritmu?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Bergabung dengan ribuan pembaca lainnya dan nikmati pengalaman membaca komik terbaik
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/pustaka"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-indigo-500/50 hover:scale-105 flex items-center gap-2"
              >
                Mulai Membaca
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/history"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-gray-300 dark:border-gray-700"
              >
                Lihat Riwayat
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-8 fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">KanataToon</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Platform baca komik online terbaik dengan koleksi terlengkap dan update harian.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Kategori</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/terbaru" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terbaru</Link></li>
                    <li><Link to="/trending" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Trending</Link></li>
                    <li><Link to="/pustaka" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pustaka</Link></li>
                    <li><Link to="/unlimited" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Unlimited</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Informasi</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/history" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Riwayat Baca</Link></li>
                    <li className="text-gray-600 dark:text-gray-400">Update Harian</li>
                    <li className="text-gray-600 dark:text-gray-400">Baca Gratis</li>
                    <li className="text-gray-600 dark:text-gray-400">No Ads</li>
                  </ul>
                </div>
              </div>
              <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  KanataToon - Platform baca komik online terbaik
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                  &copy; {new Date().getFullYear()} KanataToon. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}

export default Home