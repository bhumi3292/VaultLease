import React from 'react'
import { Outlet } from 'react-router-dom'
import Headers from '../layouts/navbar.jsx'

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50"> {/* Added light bg to contrast with floating nav */}
            <Headers />
            <div className="flex-grow pt-[120px]"> {/* Increased padding for floating navbar space */}
                <Outlet />
            </div>
        </div>
    )
}