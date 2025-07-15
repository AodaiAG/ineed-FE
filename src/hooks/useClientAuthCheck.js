import { useState, useEffect } from 'react';
import clientApi from '../utils/clientApi';

const useClientAuthCheck = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            setLoading(true);
            try {
                const response = await clientApi.get('/auth/verify-client');
                setIsAuthenticated(true);
                setUser(response.data.decryptedUserdata);
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    return { isAuthenticated, loading, user };
};

export default useClientAuthCheck;
