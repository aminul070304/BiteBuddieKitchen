import React from 'react'
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {

  const navigate = useNavigate()

  const handleRedirect = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
        <p className="mt-4 text-lg">Something went wrong. Redirect to the home page.</p>
        <button
          onClick={handleRedirect}
          className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}

export default ErrorPage
