import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    text: "Service Flow has transformed the way we manage our workflow!",
    author: "John Doe",
    position: "CEO, XYZ Corp",
  },
  {
    text: "Incredible experience using Service Flow! Super easy to use.",
    author: "Jane Smith",
    position: "Product Manager, ABC Ltd",
  },
  {
    text: "A must-have tool for businesses looking to automate processes.",
    author: "Michael Johnson",
    position: "CTO, StartupX",
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const prevTestimonial = () => setIndex((index - 1 + testimonials.length) % testimonials.length);
  const nextTestimonial = () => setIndex((index + 1) % testimonials.length);

  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h2 className="text-4xl font-bold text-green-700">What Our Users Say</h2>
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-xl text-gray-700 dark:text-gray-300 italic">"{testimonials[index].text}"</p>
        <p className="mt-4 font-semibold text-green-600">{testimonials[index].author}</p>
        <p className="text-gray-500">{testimonials[index].position}</p>
        <div className="flex justify-center mt-6">
          <button onClick={prevTestimonial} className="p-2 mx-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            <ChevronLeft />
          </button>
          <button onClick={nextTestimonial} className="p-2 mx-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
