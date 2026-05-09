import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');
            const response = await axios.post(`${apiUrl}/admin/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('adminUser', response.data.username);
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card animate__animated animate__fadeIn">
                <div className="login-header">
                    <div className="login-icon">
                        <FaLock />
                    </div>
                    <h2>Admin Portal</h2>
                    <p>Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username"><FaUser /> Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password"><FaLock /> Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Your password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                Login <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
                .admin-login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0f;
                    padding: 20px;
                    font-family: 'Inter', sans-serif;
                }

                .login-card {
                    background: rgba(20, 20, 25, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 450px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .login-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 24px;
                    color: white;
                    box-shadow: 0 10px 20px rgba(0, 212, 255, 0.3);
                }

                .login-header h2 {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 10px;
                    background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .login-header p {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-group input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: white;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #00d4ff;
                    background: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.1);
                }

                .login-button {
                    background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                }

                .login-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 212, 255, 0.3);
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .error-message {
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid rgba(255, 0, 0, 0.3);
                    color: #ff4d4d;
                    padding: 12px;
                    border-radius: 10px;
                    font-size: 14px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
