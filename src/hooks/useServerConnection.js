import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

/**
 * 서버 연결 상태를 관리하는 커스텀 훅
 */
export function useServerConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            setIsChecking(true);
            try {
                const response = await apiClient.get('/api/tips/random');
                setIsConnected(response.ok);
            } catch (error) {
                setIsConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkConnection();
    }, []);

    const recheckConnection = async () => {
        setIsChecking(true);
        try {
            const response = await apiClient.get('/api/tips/random');
            setIsConnected(response.ok);
        } catch (error) {
            setIsConnected(false);
        } finally {
            setIsChecking(false);
        }
    };

    return {
        isConnected,
        isChecking,
        recheckConnection,
    };
}

export default useServerConnection;
