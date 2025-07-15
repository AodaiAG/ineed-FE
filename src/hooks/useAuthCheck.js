import { useState, useEffect } from 'react';
import api from '../utils/api';

const useAuthCheck = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Add user state to store response data
    

    useEffect(() => {
        const verifyAuth = async () => {
            setLoading(true);
            try {
                const response = await api.get('/auth/verify-auth');
                setIsAuthenticated(true); // Authentication successful
                setUser(response.data.decryptedUserdata); // Store user data from response
            } catch (error) {
                setIsAuthenticated(false); // Authentication failed
                setUser(null); // Clear user data if authentication fails
            } finally {
                setLoading(false); // Loading complete
            }
        };

        verifyAuth();
    }, []); // Only run once on mount

    return { isAuthenticated, loading, user }; // Return user along with other states
};

export default useAuthCheck;
