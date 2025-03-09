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

    observer.observe(ref.current);

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

  return (
    <div className="relative w-full flex justify-center items-center text-center">
      {/* Large Background Text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-0 leading-none">
        <h1 className="text-[350px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-white dark:to-black opacity-30 select-none">
          SERVICE
        </h1>
        <h1 className="text-[350px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-green-700 to-white dark:to-black opacity-30 select-none">
          FLOW
        </h1>
      </div>

      {/* Animated Text */}
      <p
        ref={ref}
        className={`split-parent ${className} relative z-10 mt-[-80px] text-8xl font-extrabold text-green-700 dark:text-green-500`}
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
