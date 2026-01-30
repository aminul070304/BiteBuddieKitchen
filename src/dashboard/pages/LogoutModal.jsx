import React from 'react'

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg max-w-sm w-full relative shadow-lg text-center'>
                <h2 className='text-lg font-semibold mb-4'>Are you sure want to logout?</h2>
                <div className='flex justify-around mt-4'>
                    <button onClick={onConfirm} className='px-4 py-2 bg-red-300 text-gray-700 rounded hover:bg-red-400'>
                        Yes
                    </button>
                    <button onClick={onCancel} className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'>No</button>
                </div>
            </div>
        </div>
    )
}

export default LogoutModal
