
import { useEffect, useRef, useState } from 'react';

const useCountingAnimation = (endValue, duration = 2000, startOnIntersect = true) => {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);
    const animationFrameId = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && startOnIntersect && !hasAnimated.current) {
                    let startTime = null;
                    const animateCount = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const progress = (currentTime - startTime) / duration;
                        const currentCount = Math.min(progress, 1) * endValue;
                        setCount(Math.floor(currentCount));

                        if (progress < 1) {
                            animationFrameId.current = requestAnimationFrame(animateCount);
                        } else {
                            setCount(endValue);
                            hasAnimated.current = true;
                        }
                    };
                    animationFrameId.current = requestAnimationFrame(animateCount);
                } else if (!entry.isIntersecting && hasAnimated.current && !startOnIntersect) {

                    if (animationFrameId.current) {
                        cancelAnimationFrame(animationFrameId.current);
                    }
                    setCount(0);
                    hasAnimated.current = false;
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [endValue, duration, startOnIntersect]);

    return [count, elementRef];
};

export default useCountingAnimation;