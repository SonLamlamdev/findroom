  import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import axios from '../config/axios';
  import toast from 'react-hot-toast';
  import { getErrorMessage } from '../utils/errorHandler';

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'tenant' | 'landlord' | 'admin';
    avatar?: string;
    preferences?: {
      language: string;
      theme: string;
    };
  }

  interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
  }

  interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: 'tenant' | 'landlord';
    phone?: string;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
  };

  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Đã đăng xuất');
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (token) {
        fetchCurrentUser();
      } else {
        setLoading(false);
      }
    }, [token]);

    const login = async (email: string, password: string) => {
      try {
        const response = await axios.post('/api/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success('Đăng nhập thành công!');
      } catch (error: any) {
        const message = getErrorMessage(error, 'Đăng nhập thất bại');
        toast.error(message);
        // Throw a new error with string message instead of the original error object
        throw new Error(message);
      }
    };

    const register = async (data: RegisterData) => {
      try {
        const response = await axios.post('/api/auth/register', data);
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success('Đăng ký thành công!');
      } catch (error: any) {
        const message = getErrorMessage(error, 'Đăng ký thất bại');
        toast.error(message);
        // Throw a new error with string message instead of the original error object
        throw new Error(message);
      }
    };

    return (
      <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
        {children}
      </AuthContext.Provider>
    );
  };








