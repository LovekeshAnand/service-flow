import { motion, useMotionValue, useSpring } from "framer-motion";

const MagneticButton = ({ text }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 8 });
  const springY = useSpring(y, { stiffness: 150, damping: 8 });

  const handleMouseMove = (e) => {
    const button = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - (button.left + button.width / 2)) / 3; // Stronger effect
    const offsetY = (e.clientY - (button.top + button.height / 2)) / 3; 

    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative px-8 py-4 text-lg font-semibold text-white bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-all"
    >
      {text}
    </motion.button>
  );
};

export default MagneticButton;
