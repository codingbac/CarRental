import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
      
      <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
        
        {/* Logo & Description */}
        <div className='max-w-80'>
            <img src={assets.logo} alt="logo" className={`mb-4 h-8 md:h-9`} />
          

          <p className='text-sm'>
            Premium car rental service with a wide selection of luxury and
            everyday vehicles for all your driving needs.
          </p>

          <div className='flex items-center gap-3 mt-4'>
            {/* Facebook */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 9H15V6.5h-1.5c-1.933 0-3.5 1.567-3.5 3.5v1.5H8v3h2.5V21h3v-7.5H16l.5-3h-3z" />
            </svg>

            {/* Instagram */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM4.5 7.75A3.25 3.25 0 017.75 4.5h8.5a3.25 3.25 0 013.25 3.25v8.5a3.25 3.25 0 01-3.25 3.25h-8.5a3.25 3.25 0 01-3.25-3.25v-8.5zm9.5 1a4 4 0 11-4 4 4 4 0 014-4zm0 1.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zm3.5-.75a.75.75 0 11.75-.75.75.75 0 01-.75.75z" />
            </svg>

            {/* Twitter */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 5.92a8.2 8.2 0 01-2.36.65A4.1 4.1 0 0021.4 4a8.27 8.27 0 01-2.6 1A4.14 4.14 0 0016 4a4.15 4.15 0 00-4.15 4.15c0 .32.04.64.1.94a11.75 11.75 0 01-8.52-4.32 4.14 4.14 0 001.29 5.54A4.1 4.1 0 013 10v.05a4.15 4.15 0 003.33 4.07 4.12 4.12 0 01-1.87.07 4.16 4.16 0 003.88 2.89A8.33 8.33 0 012 19.56a11.72 11.72 0 006.29 1.84c7.55 0 11.68-6.25 11.68-11.67 0-.18 0-.35-.01-.53A8.18 8.18 0 0022 5.92z" />
            </svg>

            {/* Email */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 6h16v12H4V6zm0 0l8 6 8-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className='text-lg text-gray-800 font-medium'>
            QUICK LINKS
          </p>

          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">Home</a></li>
            <li><a href="#">Browse Cars</a></li>
            <li><a href="#">List Your Car</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <p className='text-lg text-gray-800 font-medium'>
            RESOURCES
          </p>

          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Insurance</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className='max-w-80'>
          <p className='text-lg text-gray-800 font-medium'>
            CONTACT
          </p>

          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li>Durbar Marg, Kathmandu 44600</li>
            <li>Bagmati Province, Nepal</li>
            <li>+977 9801234567</li>
            <li>info@carrentalnepal.com</li>
          </ul>
        </div>
      </div>

      <hr className='border-gray-300 mt-8' />

      {/* Bottom Footer */}
      <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
        <p>
          © {new Date().getFullYear()} CarRental Nepal. All rights reserved.
        </p>

        <ul className='flex items-center gap-4 text-sm'>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Cookies</a></li>
        </ul>
      </div>
    </div>
  )
}

export default Footer