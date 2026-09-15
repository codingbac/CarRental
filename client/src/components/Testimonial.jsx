import React from "react";
import Title from "./Title";
import { assets } from "../assets/assets";

const Testimonial = () => {
  const testimonials = [
    {
      name: "Emma",
      address: "Banepa, Nepal",
      image: assets.testimonial_image_2,
      rating: 5,
      review:
        "Exceptional service and attention to detail. Everything was handled professionally and efficiently from start to finish. Highly recommended!",
    },
    {
      name: "Liam",
      address: "Kathmandu, Nepal",
      image: assets.testimonial_image_1,
      rating: 4,
      review:
        "I’m truly impressed by the quality and consistency. The entire process was smooth, and the results exceeded all expectations. Thank you!",
    },
    {
      name: "Sophia",
      address: "Hetauda, Nepal",
      image: assets.testimonial_image_2,
      rating: 5,
      review:
        "Fantastic experience! From start to finish, the team was professional, responsive, and genuinely cared about delivering great results.",
    },
  ];

  return (
    <div className="py-26 px-6 md:px-16 lg:px-24 xl:px-44">
      <Title
        title="What Our Customers Say"
        subTitle="Discover why discerning travelers choose StayVenture for their luxury accommodations around the world."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500"
          >
            {/* User Info */}
            <div className="flex items-center gap-3">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={testimonial.image}
                alt={testimonial.name}
              />

              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.address}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-4">
              {Array(testimonial.rating)
                .fill()
                .map((_, i) => (
                  <img
                    key={i}
                    className="w-4 h-4"
                    src={assets.star_icon}
                    alt="star"
                  />
                ))}
            </div>

            {/* Review */}
            <p className="text-gray-700 mt-4 leading-relaxed">
              "{testimonial.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;