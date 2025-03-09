import Marquee from "react-fast-marquee";

const MarqueeLogos = () => {
  return (
    <div className="mt-20 bg-gray-100 dark:bg-gray-800 py-6">
      <Marquee speed={50} gradient={false}>
        <img src="/brand1.svg" alt="Brand 1" className="h-10 mx-6" />
        <img src="/brand2.svg" alt="Brand 2" className="h-10 mx-6" />
        <img src="/brand3.svg" alt="Brand 3" className="h-10 mx-6" />
        <img src="/brand4.svg" alt="Brand 4" className="h-10 mx-6" />
      </Marquee>
    </div>
  );
};

export default MarqueeLogos;
