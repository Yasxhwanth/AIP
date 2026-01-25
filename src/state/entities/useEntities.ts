import { useContext } from 'react';
import { EntityContext } from './EntityStore';

/**
 * useEntities Hook
 * 
 * Provides access to the entity store and selection state.
 * Throws an error if used outside of an EntityProvider.
 */
export const useEntities = () => {
    const context = useContext(EntityContext);

    if (context === undefined) {
        throw new Error('useEntities must be used within an EntityProvider');
    }

    return context;
};
