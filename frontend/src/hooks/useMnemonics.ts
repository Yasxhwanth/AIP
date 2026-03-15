import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useMnemonics = () => {
    const router = useRouter();
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [lastTime, setLastTime] = useState<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            const now = Date.now();
            const key = e.key.toLowerCase();

            // Sequence timeout: 500ms
            if (now - lastTime > 500) {
                setLastKey(null);
            }

            if (lastKey === 'g') {
                switch (key) {
                    case 'o':
                        router.push('/ontology');
                        break;
                    case 'i':
                        router.push('/integrations');
                        break;
                    case 's':
                        router.push('/run/dashboard');
                        break;
                    case 'a':
                        router.push('/admin/agent-studio');
                        break;
                    case 't':
                        router.push('/telemetry');
                        break;
                    default:
                        break;
                }
                setLastKey(null);
            } else if (key === 'g') {
                setLastKey('g');
                setLastTime(now);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lastKey, lastTime, router]);
};
