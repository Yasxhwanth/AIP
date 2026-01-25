import React from 'react';
import { useReplay } from '../context/ReplayContext';
import { ShieldCheck } from 'lucide-react';

export const ReplayModeBanner: React.FC = () => {
    const { isReplayMode } = useReplay();

    if (!isReplayMode) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-yellow-900/90 text-yellow-100 flex items-center justify-center z-[3000] border-b border-yellow-500 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-3 animate-pulse">
                <ShieldCheck size={20} />
                <span className="font-bold tracking-widest">SYSTEM IN READ-ONLY REPLAY MODE</span>
                <span className="text-xs opacity-75 font-mono">NO ACTIONS WILL BE EXECUTED</span>
            </div>
        </div>
    );
};
