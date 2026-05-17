import { Link } from 'react-router'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          <span className="text-indigo-600">My Toolbox</span>
        </h1>
        <p className="text-lg text-gray-600">
          Votre collection d'outils pour développer plus efficacement
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-8 py-8 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Screenshot Framer Card */}
          <Link 
            to="/screenshot-framer" 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                Screenshot Framer
              </h3>
              <p className="text-gray-600 text-sm">
                Ajoutez un fond coloré personnalisé à vos captures d'écran avec un ratio 3:2
              </p>
            </div>
            <div className="px-6 pb-6">
              <span className="text-indigo-600 text-sm font-medium group-hover:underline">
                Essayer →
              </span>
            </div>
          </Link>
          {/* Triple Mobile Framer Card */}
          <Link
            to="/triple-framer"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                Triple Mobile Framer
              </h3>
              <p className="text-gray-600 text-sm">
                Mettez 3 captures d'écran mobiles dans un mockup téléphone et téléchargez le résultat
              </p>
            </div>
            <div className="px-6 pb-6">
              <span className="text-indigo-600 text-sm font-medium group-hover:underline">
                Essayer →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */
      <footer className="py-6 text-center">
        <p className="text-gray-600 flex items-center justify-center gap-2">
          Made with <span className="text-red-500">❤️</span> by{' '}
          <a 
            href="https://farihane.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
          >
            Farihane
          </a>
        </p>
      </footer>
    </div>
  );
}

export default Home;
