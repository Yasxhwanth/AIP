import { useContext } from 'react';
import { TimeContext } from './TimeContext';

/**
 * useTime Hook
 * 
 * Provides access to the global time state.
 * Throws an error if used outside of a TimeProvider.
 */
export const useTime = () => {
    const context = useContext(TimeContext);

    if (context === undefined) {
        throw new Error('useTime must be used within a TimeProvider');
    }

    return context;
};
