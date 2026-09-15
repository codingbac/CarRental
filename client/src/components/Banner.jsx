import React from 'react'
import { assets } from '../assets/assets'

const Banner = () => {
  return (
    <div className={`flex flex-col md:flex-row md:items-start items-center justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden`}>
      
<div className="text-white">
  <h2 className="text-3xl font-medium">
    Do You Own a Luxury Car?
  </h2>

  <p className="mt-2">
    Monetize your vehicle effortlessly by listing it on CarRental.
  </p>

  <p className="max-w-md mt-2">
    We take care of insurance, driver verification, and secure payments —
    so you can earn passive income, stress-free.
  </p>

  <button
  className="mt-4 px-6 py-3 bg-white text-black rounded-full hover:bg-slate-100 transition-all duration-300 cursor-pointer font-medium shadow-sm"
>
  List Your Car
</button>
</div>
    <img src={assets.banner_car_image} alt="car" className={`max-h-45 mt-10`}/>


    </div>
  )
}

export default Banner
