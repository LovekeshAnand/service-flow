import { useSprings, animated } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

const SplitText = ({
  text = "",
  className = "",
  delay = 100,
  animationFrom = { opacity: 0, transform: "translate3d(0,40px,0)" },
  animationTo = { opacity: 1, transform: "translate3d(0,0,0)" },
  easing = "easeOutCubic",
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const words = text.split(" ").map((word) => word.split(""));
  const letters = words.flat();
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = useSprings(
    letters.length,
    letters.map((_, i) => ({
      from: animationFrom,
      to: inView
        ? async (next) => {
            await next(animationTo);
            animatedCount.current += 1;
            if (
              animatedCount.current === letters.length &&
              onLetterAnimationComplete
            ) {
              onLetterAnimationComplete();
            }
          }
        : animationFrom,
      delay: i * delay,
      config: { easing },
    }))
  );

  // Responsive font size calculations
  const getBackgroundFontSize = () => {
    if (windowWidth < 640) return "text-8xl"; // Small mobile
    if (windowWidth < 768) return "text-9xl"; // Mobile
    if (windowWidth < 1024) return "text-[200px]"; // Tablet
    return "text-[350px]"; // Desktop
  };

  const getAnimatedTextSize = () => {
    if (windowWidth < 640) return "text-3xl mt-[-20px]"; // Small mobile
    if (windowWidth < 768) return "text-4xl mt-[-30px]"; // Mobile
    if (windowWidth < 1024) return "text-6xl mt-[-50px]"; // Tablet
    return "text-8xl mt-[-80px]"; // Desktop
  };

  return (
    <div className="relative w-full flex justify-center items-center text-center">
      {/* Large Background Text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-0 leading-none">
        <h1 className={`${getBackgroundFontSize()} font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-white dark:to-black opacity-30 select-none`}>
          SERVICE
        </h1>
        <h1 className={`${getBackgroundFontSize()} font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-white dark:to-black opacity-30 select-none`}>
          FLOW
        </h1>
      </div>

      {/* Animated Text */}
      <p
        ref={ref}
        className={`split-parent ${className} relative z-10 font-extrabold text-green-700 dark:text-green-500 ${getAnimatedTextSize()}`}
        style={{
          textAlign,
          overflow: "hidden",
          display: "inline",
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.map((letter, letterIndex) => {
              const index = words
                .slice(0, wordIndex)
                .reduce((acc, w) => acc + w.length, 0) + letterIndex;

              return (
                <animated.span
                  key={index}
                  style={{
                    ...springs[index],
                    display: "inline-block",
                    willChange: "transform, opacity",
                  }}
                >
                  {letter}
                </animated.span>
              );
            })}
            <span style={{ display: "inline-block", width: "0.3em" }}>&nbsp;</span>
          </span>
        ))}
      </p>
    </div>
  );
};

export default SplitText;