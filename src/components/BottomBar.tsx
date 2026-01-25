import React, { useState, useMemo } from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { useTime } from '../state/time/useTime';
import { usePlayback } from '../state/playback/PlaybackContext';

/**
 * BottomBar
 * 
 * UI-TC-1 (Time Sovereignty): Only the Bottom Bar may control time.
 * 
 * Contains:
 * - Play / Pause
 * - Playback Speed
 * - Timeline Scrubber with red position indicator
 * - AS OF Timestamp
 * - LIVE / HISTORY Toggle
 */
const BottomBar: React.FC = () => {
    const { asOf, setAsOf } = useTime();
    const { isPlaying, play, pause, playbackSpeed, setSpeed, renderTime, scrub } = usePlayback();
    const [isLive, setIsLive] = useState(false);

    // Calculate slider position as percentage (0-100)
    const sliderPosition = useMemo(() => {
        const hours = renderTime.getHours();
        const minutes = renderTime.getMinutes();
        return ((hours + minutes / 60) / 24) * 100;
    }, [renderTime]);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        const hours = Math.floor(value);
        const minutes = Math.floor((value - hours) * 60);

        // Anchor scrubbing around the seeded ontology date
        const newTime = new Date('2026-01-23T10:00:00Z');
        newTime.setHours(hours);
        newTime.setMinutes(minutes);

        setAsOf(newTime);
        scrub(newTime);
    };

    return (
        <div className="bottom-bar" style={{
            height: '64px',
            backgroundColor: 'var(--surface-1)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '24px',
            zIndex: 100,
            flexShrink: 0
        }}>
            {/* Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={isPlaying ? pause : play}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>

                <select
                    value={playbackSpeed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{
                        backgroundColor: 'var(--surface-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        outline: 'none',
                        fontWeight: 600
                    }}
                    title="Playback Speed"
                >
                    <option value={1}>1x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                    <option value={60}>60x</option>
                    <option value={3600}>1h/s</option>
                </select>
            </div>

            {/* AS OF Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '260px' }}>
                <div style={{
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Clock size={12} />
                    As Of
                </div>
                <div style={{
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
                }}>
                    {asOf.toISOString().replace('T', ' ').split('.')[0]} UTC
                </div>
            </div>

            {/* Timeline Scrubber with Red Position Indicator */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: '24px' }}>
                {/* Track background */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: '2px'
                }} />

                {/* Red Position Indicator Dot */}
                <div style={{
                    position: 'absolute',
                    left: `${sliderPosition}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#FF4D4D',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(255, 77, 77, 0.6)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                {/* Invisible Range Input */}
                <input
                    type="range"
                    min="0"
                    max="24"
                    step="0.1"
                    value={renderTime.getHours() + renderTime.getMinutes() / 60}
                    onChange={handleTimeChange}
                    style={{
                        width: '100%',
                        height: '24px',
                        appearance: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 3
                    }}
                />
            </div>

            {/* Live / History Toggle */}
            <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <button
                    onClick={() => setIsLive(false)}
                    style={{
                        padding: '8px 16px',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        backgroundColor: !isLive ? 'var(--accent)' : 'transparent',
                        color: !isLive ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    HISTORY
                </button>
                <button
                    onClick={() => setIsLive(true)}
                    style={{
                        padding: '8px 16px',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        backgroundColor: isLive ? 'var(--accent)' : 'transparent',
                        color: isLive ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    LIVE
                </button>
            </div>
        </div>
    );
};

export default BottomBar;
