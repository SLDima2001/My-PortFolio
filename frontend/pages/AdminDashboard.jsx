import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaFolderOpen, FaEnvelope, FaTachometerAlt, FaChevronRight, FaDownload } from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [cvInfo, setCvInfo] = useState(null);
    const [cvUploading, setCvUploading] = useState(false);
    const navigate = useNavigate();

    // Form state for projects
    const [isEditing, setIsEditing] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [projectForm, setProjectForm] = useState({
        title: '',
        description: '',
        image: '',
        tech: '',
        liveUrl: '',
        githubUrl: '',
        featured: false
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin-login');
            return;
        }
        setAdminName(localStorage.getItem('adminUser'));
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';

        try {
            const projectsRes = await axios.get(`${apiUrl}/projects`);
            setProjects(projectsRes.data);

            const feedbackRes = await axios.get(`${apiUrl}/feedback`, { headers });
            setMessages(feedbackRes.data.data);

            const cvRes = await axios.get(`${apiUrl}/cv/latest`);
            setCvInfo(cvRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        navigate('/admin-login');
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const data = {
            ...projectForm,
            tech: typeof projectForm.tech === 'string' ? projectForm.tech.split(',').map(s => s.trim()) : projectForm.tech
        };

        const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';

        try {
            if (isEditing) {
                await axios.put(`${apiUrl}/projects/${currentProjectId}`, data, { headers });
            } else {
                await axios.post(`${apiUrl}/projects`, data, { headers });
            }
            resetForm();
            fetchData();
            alert(`Project ${isEditing ? 'updated' : 'added'} successfully!`);
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEditProject = (project) => {
        setProjectForm({
            title: project.title,
            description: project.description,
            image: project.image,
            tech: project.tech.join(', '),
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            featured: project.featured
        });
        setCurrentProjectId(project._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';

        try {
            await axios.delete(`${apiUrl}/projects/${id}`, { headers });
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';

        try {
            await axios.delete(`${apiUrl}/feedback/${id}`, { headers });
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleCVUpload = async (e) => {
        e.preventDefault();
        if (!cvFile) return alert('Please select a file');
        
        const formData = new FormData();
        formData.append('cv', cvFile);
        
        setCvUploading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        };
        const apiUrl = import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app';

        try {
            await axios.post(`${apiUrl}/cv/upload`, formData, { headers });
            alert('CV uploaded successfully!');
            setCvFile(null);
            fetchData();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setCvUploading(false);
        }
    };

    const resetForm = () => {
        setProjectForm({
            title: '',
            description: '',
            image: '',
            tech: '',
            liveUrl: '',
            githubUrl: '',
            featured: false
        });
        setIsEditing(false);
        setCurrentProjectId(null);
    };

    return (
        <div className="admin-dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="admin-avatar">
                        {adminName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-info">
                        <h3>{adminName}</h3>
                        <span>Administrator</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={activeTab === 'projects' ? 'active' : ''} 
                        onClick={() => setActiveTab('projects')}
                    >
                        <FaFolderOpen /> Projects
                    </button>
                    <button 
                        className={activeTab === 'messages' ? 'active' : ''} 
                        onClick={() => setActiveTab('messages')}
                    >
                        <FaEnvelope /> Messages
                    </button>
                    <button 
                        className={activeTab === 'cv' ? 'active' : ''} 
                        onClick={() => setActiveTab('cv')}
                    >
                        <FaDownload /> CV Management
                    </button>
                </nav>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                </button>
            </aside>

            <main className="dashboard-content">
                <header className="content-header">
                    <h2>
                        {activeTab === 'projects' ? 'Manage Portfolio Projects' : 
                         activeTab === 'messages' ? 'Contact Messages' : 
                         'CV Management'}
                    </h2>
                    <div className="breadcrumb">
                        <FaTachometerAlt /> Dashboard <FaChevronRight /> <span>{activeTab}</span>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">Loading dashboard data...</div>
                ) : (
                    <div className="tab-content animate__animated animate__fadeIn">
                        {activeTab === 'projects' && (
                            <div className="projects-tab">
                                <div className="form-card">
                                    <h3>{isEditing ? 'Edit Project' : 'Add New Project'}</h3>
                                    <form onSubmit={handleProjectSubmit} className="project-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Project Title</label>
                                                <input 
                                                    type="text" 
                                                    value={projectForm.title} 
                                                    onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Featured</label>
                                                <div className="checkbox-wrapper">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={projectForm.featured} 
                                                        onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})} 
                                                    />
                                                    <span>Show as featured project</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea 
                                                value={projectForm.description} 
                                                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Image URL</label>
                                                <input 
                                                    type="text" 
                                                    value={projectForm.image} 
                                                    onChange={(e) => setProjectForm({...projectForm, image: e.target.value})} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Tech Stack (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={projectForm.tech} 
                                                    onChange={(e) => setProjectForm({...projectForm, tech: e.target.value})} 
                                                    required 
                                                    placeholder="React, Node.js, MongoDB"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Live URL</label>
                                                <input 
                                                    type="text" 
                                                    value={projectForm.liveUrl} 
                                                    onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})} 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>GitHub URL</label>
                                                <input 
                                                    type="text" 
                                                    value={projectForm.githubUrl} 
                                                    onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">
                                                {isEditing ? <><FaEdit /> Update Project</> : <><FaPlus /> Add Project</>}
                                            </button>
                                            {isEditing && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}
                                        </div>
                                    </form>
                                </div>

                                <div className="data-list">
                                    <h3>Existing Projects ({projects.length})</h3>
                                    <div className="project-grid">
                                        {projects.map(project => (
                                            <div key={project._id} className="dashboard-project-card">
                                                <img src={project.image} alt={project.title} />
                                                <div className="card-details">
                                                    <h4>{project.title}</h4>
                                                    <div className="card-actions">
                                                        <button onClick={() => handleEditProject(project)} className="edit-action"><FaEdit /></button>
                                                        <button onClick={() => handleDeleteProject(project._id)} className="delete-action"><FaTrash /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="messages-tab">
                                <div className="message-list">
                                    {messages.length === 0 ? (
                                        <div className="empty-state">No messages received yet.</div>
                                    ) : (
                                        messages.map(msg => (
                                            <div key={msg._id} className="message-card">
                                                <div className="message-header">
                                                    <div className="sender-info">
                                                        <h4>{msg.firstname} {msg.lastname}</h4>
                                                        <span>{msg.email} | {msg.phonenumber}</span>
                                                    </div>
                                                    <div className="message-meta">
                                                        <span className="rating">Rating: {msg.rating}/5</span>
                                                        <button onClick={() => handleDeleteMessage(msg._id)} className="delete-action"><FaTrash /></button>
                                                    </div>
                                                </div>
                                                <div className="message-body">
                                                    <div className="msg-subject">Subject: {msg.subject}</div>
                                                    <p>{msg.message}</p>
                                                    <div className="msg-date">{new Date(msg.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'cv' && (
                            <div className="cv-tab">
                                <div className="form-card">
                                    <h3>Upload New CV</h3>
                                    <p className="tab-desc" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Upload your latest resume (PDF, Word, etc.). This will replace the existing CV on the frontend.</p>
                                    <form onSubmit={handleCVUpload} className="cv-upload-form" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div className="file-input-wrapper" style={{ flex: 1 }}>
                                            <input 
                                                type="file" 
                                                onChange={(e) => setCvFile(e.target.files[0])} 
                                                className="file-input"
                                                style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', width: '100%', color: 'white' }}
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={cvUploading} style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)', border: 'none', padding: '12px 25px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {cvUploading ? 'Uploading...' : <><FaPlus /> Upload CV</>}
                                        </button>
                                    </form>
                                </div>

                                {cvInfo && (
                                    <div className="data-list" style={{ marginTop: '30px' }}>
                                        <h3>Current Active CV</h3>
                                        <div className="message-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="message-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div className="sender-info">
                                                    <h4 style={{ fontSize: '18px', marginBottom: '5px' }}>{cvInfo.originalname}</h4>
                                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Uploaded on: {new Date(cvInfo.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="message-meta">
                                                    <span className="rating" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>{cvInfo.mimetype}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <style>{`
                .admin-dashboard {
                    display: flex;
                    min-height: 100vh;
                    background: #0a0a0f;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }

                .sidebar {
                    width: 280px;
                    background: rgba(20, 20, 25, 0.95);
                    backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 50px;
                }

                .admin-avatar {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 800;
                    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
                }

                .admin-info h3 {
                    font-size: 16px;
                    margin: 0;
                }

                .admin-info span {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                }

                .sidebar-nav button {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    padding: 14px 20px;
                    border-radius: 12px;
                    text-align: left;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                }

                .sidebar-nav button:hover, .sidebar-nav button.active {
                    background: rgba(0, 212, 255, 0.1);
                    color: #00d4ff;
                }

                .logout-btn {
                    margin-top: auto;
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid rgba(255, 0, 0, 0.2);
                    color: #ff4d4d;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 600;
                }

                .dashboard-content {
                    flex: 1;
                    padding: 40px;
                    overflow-y: auto;
                }

                .content-header {
                    margin-bottom: 40px;
                }

                .content-header h2 {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 10px;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }

                .breadcrumb span {
                    color: #00d4ff;
                    text-transform: capitalize;
                }

                .form-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 30px;
                    margin-bottom: 40px;
                }

                .form-card h3 {
                    margin-bottom: 25px;
                    font-size: 20px;
                }

                .project-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .form-group input, .form-group textarea {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 12px 15px;
                    color: white;
                    font-family: inherit;
                }

                .form-group textarea {
                    height: 100px;
                    resize: vertical;
                }

                .checkbox-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    height: 44px;
                }

                .submit-btn {
                    background: linear-gradient(135deg, #00d4ff 0%, #9333ea 100%);
                    border: none;
                    border-radius: 10px;
                    padding: 14px 30px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: fit-content;
                }

                .form-actions {
                    display: flex;
                    gap: 15px;
                }

                .cancel-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    padding: 14px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                }

                .project-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }

                .dashboard-project-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 15px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .dashboard-project-card img {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                }

                .card-details {
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-details h4 {
                    font-size: 14px;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100px;
                }

                .card-actions {
                    display: flex;
                    gap: 8px;
                }

                .card-actions button {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .edit-action:hover { color: #00d4ff; background: rgba(0, 212, 255, 0.1); }
                .delete-action:hover { color: #ff4d4d; background: rgba(255, 0, 0, 0.1); }

                .message-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .message-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 25px;
                }

                .message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .sender-info h4 {
                    font-size: 18px;
                    margin-bottom: 5px;
                }

                .sender-info span {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .message-meta {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .rating {
                    background: rgba(0, 212, 255, 0.1);
                    color: #00d4ff;
                    padding: 4px 10px;
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .msg-subject {
                    font-weight: 700;
                    margin-bottom: 10px;
                    color: #9333ea;
                }

                .message-body p {
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .msg-date {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    text-align: right;
                }

                .empty-state, .loading-state {
                    text-align: center;
                    padding: 50px;
                    color: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
