import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTime } from '../time/useTime';

interface PlaybackContextType {
    renderTime: Date;
    isPlaying: boolean;
    playbackSpeed: number;
    play: () => void;
    pause: () => void;
    setSpeed: (speed: number) => void;
    scrub: (time: Date) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { asOf } = useTime();

    // renderTime determines the VISUAL state (interpolation target)
    // Initialize with asOf, but it can diverge during playback
    const [renderTime, setRenderTime] = useState<Date>(asOf);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1 second real time = 1 second simulation time? No, usually faster.
    // Let's assume 1x means 1 second real time = 1 minute simulation time, or just 1:1?
    // For a logistics map, 1:1 is too slow.
    // Let's define speed as multiplier of real-time. 
    // If speed is 1, then 1 real second = 1 simulation second.
    // If speed is 60, then 1 real second = 1 simulation minute.

    const lastFrameTimeRef = useRef<number | null>(null);
    const requestRef = useRef<number | null>(null);

    // Sync renderTime with asOf when NOT playing (and initially)
    // This allows the "Truth" slider to control the view when stopped.
    useEffect(() => {
        if (!isPlaying) {
            setRenderTime(asOf);
        }
    }, [asOf, isPlaying]);

    const animate = useCallback((time: number) => {
        if (lastFrameTimeRef.current !== null) {
            const deltaTime = time - lastFrameTimeRef.current;

            setRenderTime(prevTime => {
                const newTime = new Date(prevTime.getTime() + deltaTime * playbackSpeed * 1000); // Speed multiplier
                // * 1000 might be too fast if speed is just "multiplier".
                // Let's say speed 1 = 1x real time.
                // deltaTime is in ms.
                // newTime = prevTime + deltaTime * speed.
                return new Date(prevTime.getTime() + deltaTime * playbackSpeed);
            });
        }
        lastFrameTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [playbackSpeed]);

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            lastFrameTimeRef.current = null;
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying, animate]);

    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);
    const setSpeed = (speed: number) => setPlaybackSpeed(speed);

    const scrub = (time: Date) => {
        setRenderTime(time);
        if (!isPlaying) {
            // If we scrub while paused, we might want to update asOf?
            // "PlaybackContext must never modify ontology or entities (specifically asOf)."
            // So NO. Scrubbing here is just visual.
            // But if we want to "commit" the time, we'd use the main time slider.
            // The requirement says: "Controls: Scrub: Entity jumps to correct interpolated position."
            // It doesn't say it updates asOf.
        }
    };

    return (
        <PlaybackContext.Provider value={{ renderTime, isPlaying, playbackSpeed, play, pause, setSpeed, scrub }}>
            {children}
        </PlaybackContext.Provider>
    );
};

export const usePlayback = () => {
    const context = useContext(PlaybackContext);
    if (context === undefined) {
        throw new Error('usePlayback must be used within a PlaybackProvider');
    }
    return context;
};
