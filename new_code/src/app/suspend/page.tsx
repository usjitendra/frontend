const SuspendPage = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-red-50 rounded-full opacity-70"></div>
          <svg className="mx-auto h-24 w-24 text-red-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight text-center">Account Suspended</h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-center">
          Your account has been temporarily suspended. 
          Please contact our support team for further assistance.
        </p>
        <div className="space-y-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Contact Support
          </button>
          <a href="/login" className="block text-center py-3 text-blue-600 hover:text-blue-800 transition-colors font-medium">
            Return to Login Page
          </a>
        </div>
      </div>
      <div className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} • All rights reserved
      </div>
    </div>
  )
}

export default SuspendPage