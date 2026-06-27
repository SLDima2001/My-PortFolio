import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaFolderOpen, FaEnvelope, FaTachometerAlt, FaChevronRight, FaDownload, FaImages, FaUser } from 'react-icons/fa';

const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                }, 'image/jpeg', 0.7);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const compressBase64 = (base64Str) => {
    return new Promise((resolve) => {
        if (!base64Str || !base64Str.startsWith('data:image/') || base64Str.length < 500000) {
            return resolve(base64Str);
        }
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(base64Str);
    });
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [cvInfo, setCvInfo] = useState(null);
    const [cvUploading, setCvUploading] = useState(false);
    const [projectImageFiles, setProjectImageFiles] = useState([]);
    const [coverImageIndex, setCoverImageIndex] = useState(0); // index 0 = first image is default cover
    const [profileImages, setProfileImages] = useState([]);
    const [profileImageFiles, setProfileImageFiles] = useState([]);
    const [profileUploading, setProfileUploading] = useState(false);
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
        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };

        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            const projectsRes = await axios.get(`${apiUrl}/projects`);
            setProjects(projectsRes.data);

            const feedbackRes = await axios.get(`${apiUrl}/feedback?token=${token}`, { headers });
            setMessages(feedbackRes.data.data);

            const cvRes = await axios.get(`${apiUrl}/cv/latest`);
            setCvInfo(cvRes.data);

            const profileRes = await axios.get(`${apiUrl}/profile`);
            setProfileImages(profileRes.data.images || []);
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
        console.log("Token retrieved from localStorage:", token ? "Present (Starts with " + token.substring(0, 10) + ")" : "MISSING OR NULL");

        if (!token || token === 'undefined' || token === 'null') {
            alert('Security token is missing or corrupted. Please log out and log back in.');
            return;
        }

        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };
        console.log("Sending headers object:", headers);
        
        const formData = new FormData();
        formData.append('title', projectForm.title);
        formData.append('description', projectForm.description);
        formData.append('tech', projectForm.tech);
        formData.append('liveUrl', projectForm.liveUrl);
        formData.append('githubUrl', projectForm.githubUrl);
        formData.append('featured', projectForm.featured);
        
        // Build combined image list: new files + existing images (when editing)
        // coverImageIndex tells which item in the combined list is the cover
        // We reorder so that the cover comes first (index 0 → backend uses as main image)
        const newFilesCompressed = [];
        for (let file of projectImageFiles) {
            newFilesCompressed.push(await compressImage(file));
        }

        const existingImgsCompressed = [];
        if (isEditing && projectForm.images) {
            for (let img of projectForm.images) {
                existingImgsCompressed.push(await compressBase64(img));
            }
        }

        // Combined list in display order: new files first, then existing images
        const combined = [...newFilesCompressed, ...existingImgsCompressed];

        // Reorder so cover is first
        const clampedCover = Math.min(coverImageIndex, combined.length - 1);
        if (clampedCover > 0 && combined.length > 0) {
            const [cover] = combined.splice(clampedCover, 1);
            combined.unshift(cover);
        }

        for (let item of combined) {
            formData.append('images', item);
        }

        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            const url = isEditing ? `${apiUrl}/projects/${currentProjectId}?token=${token}` : `${apiUrl}/projects?token=${token}`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed with status ' + response.status);
            }

            resetForm();
            fetchData();
            alert(`Project ${isEditing ? 'updated' : 'added'} successfully!`);
        } catch (err) {
            console.error('Project Submit Error:', err);
            alert('Operation failed: ' + err.message);
        }
    };

    const handleEditProject = (project) => {
        setProjectForm({
            title: project.title,
            description: project.description,
            images: project.images || [],
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
        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };

        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            await axios.delete(`${apiUrl}/projects/${id}?token=${token}`, { headers });
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        const token = localStorage.getItem('token');
        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };

        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            await axios.delete(`${apiUrl}/feedback/${id}?token=${token}`, { headers });
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
            'x-auth-token': token,
            'xdima-token': token
        };
        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            await axios.post(`${apiUrl}/cv/upload?token=${token}`, formData, { headers });
            alert('CV uploaded successfully!');
            setCvFile(null);
            fetchData();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setCvUploading(false);
        }
    };

    const handleProfileUpload = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        for (let file of profileImageFiles) {
            const compressedFile = await compressImage(file);
            formData.append('images', compressedFile);
        }

        // In this simple implementation, we keep existing images
        for (let img of profileImages) {
            const compressedImg = await compressBase64(img);
            formData.append('keepImages', compressedImg);
        }

        setProfileUploading(true);
        const token = localStorage.getItem('token');
        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };
        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            await axios.post(`${apiUrl}/profile/upload?token=${token}`, formData, { headers });
            alert('Profile images updated!');
            setProfileImageFiles([]);
            fetchData();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setProfileUploading(false);
        }
    };

    const handleDeleteProfileImage = async (imgToDelete) => {
        if (!window.confirm('Remove this image?')) return;
        const newImages = profileImages.filter(img => img !== imgToDelete);
        
        const token = localStorage.getItem('token');
        const headers = { 
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
            'xdima-token': token
        };
        const apiUrl = (import.meta.env.VITE_API_URL || 'https://my-port-folio-onn7.vercel.app').replace(/\/$/, '');

        try {
            const compressedNewImages = [];
            for (let img of newImages) {
                compressedNewImages.push(await compressBase64(img));
            }
            await axios.post(`${apiUrl}/profile/upload?token=${token}`, { keepImages: compressedNewImages }, { headers });
            fetchData();
        } catch (err) {
            alert('Delete failed');
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
        setProjectImageFiles([]);
        setCoverImageIndex(0);
    };

    // ── Image reorder helpers ──────────────────────────────────────────────────
    // "New files" section
    const moveNewFile = (fromIdx, toIdx) => {
        if (toIdx < 0 || toIdx >= projectImageFiles.length) return;
        const arr = [...projectImageFiles];
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        setProjectImageFiles(arr);
        // Keep cover tracking correct after reorder
        if (coverImageIndex === fromIdx) setCoverImageIndex(toIdx);
        else if (coverImageIndex === toIdx) setCoverImageIndex(fromIdx);
    };

    const removeNewFile = (idx) => {
        const arr = projectImageFiles.filter((_, i) => i !== idx);
        setProjectImageFiles(arr);
        if (coverImageIndex >= arr.length) setCoverImageIndex(Math.max(0, arr.length - 1));
    };

    // "Existing images" section (only when editing)
    const moveExistingImg = (fromIdx, toIdx) => {
        if (!projectForm.images) return;
        if (toIdx < 0 || toIdx >= projectForm.images.length) return;
        const arr = [...projectForm.images];
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        setProjectForm({ ...projectForm, images: arr });
    };

    const removeExistingImg = (idx) => {
        setProjectForm({ ...projectForm, images: projectForm.images.filter((_, i) => i !== idx) });
    };

    // Shared style generator for the tiny image control buttons
    const imgCtrlBtn = (disabled = false, active = false, danger = false) => ({
        background: danger ? 'rgba(255,60,60,0.2)' : active ? 'rgba(255,200,0,0.25)' : 'rgba(255,255,255,0.1)',
        border: 'none',
        color: danger ? '#ff6b6b' : active ? 'gold' : disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
        borderRadius: '5px',
        width: '20px',
        height: '20px',
        fontSize: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        opacity: disabled ? 0.4 : 1,
    });

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
                    <button 
                        className={activeTab === 'profile' ? 'active' : ''} 
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser /> Profile Images
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
                         activeTab === 'cv' ? 'CV Management' : 
                         'Profile Management'}
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
                                        <div className="form-group">
                                            <label>Project Images (Upload Multiple)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <label style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                    background: 'rgba(0,212,255,0.12)', border: '1px dashed rgba(0,212,255,0.4)',
                                                    borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', color: '#00d4ff',
                                                    fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap'
                                                }}>
                                                    ＋ Add Images
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            const picked = Array.from(e.target.files);
                                                            setProjectImageFiles(prev => [...prev, ...picked]);
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                                {projectImageFiles.length > 0 && (
                                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                        {projectImageFiles.length} new image{projectImageFiles.length > 1 ? 's' : ''} selected
                                                    </span>
                                                )}
                                            </div>

                                            {/* ── New-file previews ── */}
                                            {projectImageFiles.length > 0 && (
                                                <div style={{ marginTop: '14px' }}>
                                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                                                        New images — click ★ to set as cover, use ◀ ▶ to reorder
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        {projectImageFiles.map((file, idx) => {
                                                            const isCover = coverImageIndex === idx;
                                                            const previewUrl = URL.createObjectURL(file);
                                                            return (
                                                                <div key={idx} style={{
                                                                    position: 'relative', width: '90px',
                                                                    border: isCover ? '2px solid gold' : '2px solid transparent',
                                                                    borderRadius: '10px', overflow: 'visible'
                                                                }}>
                                                                    <img src={previewUrl} alt=""
                                                                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                                                                    {isCover && (
                                                                        <span style={{
                                                                            position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)',
                                                                            background: 'gold', color: '#000', fontSize: '10px', fontWeight: 800,
                                                                            borderRadius: '20px', padding: '1px 6px', whiteSpace: 'nowrap'
                                                                        }}>★ Cover</span>
                                                                    )}
                                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '5px' }}>
                                                                        <button type="button" title="Move left"
                                                                            onClick={() => moveNewFile(idx, idx - 1)}
                                                                            disabled={idx === 0}
                                                                            style={imgCtrlBtn(idx === 0)}>◀</button>
                                                                        <button type="button" title="Set as cover"
                                                                            onClick={() => setCoverImageIndex(idx)}
                                                                            style={imgCtrlBtn(false, isCover)}>★</button>
                                                                        <button type="button" title="Move right"
                                                                            onClick={() => moveNewFile(idx, idx + 1)}
                                                                            disabled={idx === projectImageFiles.length - 1}
                                                                            style={imgCtrlBtn(idx === projectImageFiles.length - 1)}>▶</button>
                                                                        <button type="button" title="Remove"
                                                                            onClick={() => removeNewFile(idx)}
                                                                            style={imgCtrlBtn(false, false, true)}>✕</button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Existing-image previews (edit mode) ── */}
                                            {isEditing && projectForm.images && projectForm.images.length > 0 && (
                                                <div style={{ marginTop: '14px' }}>
                                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                                                        Saved images — use ◀ ▶ to reorder, ✕ to remove
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        {projectForm.images.map((img, idx) => (
                                                            <div key={idx} style={{
                                                                position: 'relative', width: '90px',
                                                                border: '2px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '10px', overflow: 'visible'
                                                            }}>
                                                                <img src={img} alt=""
                                                                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '5px' }}>
                                                                    <button type="button" title="Move left"
                                                                        onClick={() => moveExistingImg(idx, idx - 1)}
                                                                        disabled={idx === 0}
                                                                        style={imgCtrlBtn(idx === 0)}>◀</button>
                                                                    <button type="button" title="Move right"
                                                                        onClick={() => moveExistingImg(idx, idx + 1)}
                                                                        disabled={idx === projectForm.images.length - 1}
                                                                        style={imgCtrlBtn(idx === projectForm.images.length - 1)}>▶</button>
                                                                    <button type="button" title="Remove"
                                                                        onClick={() => removeExistingImg(idx)}
                                                                        style={imgCtrlBtn(false, false, true)}>✕</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-row">
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

                        {activeTab === 'profile' && (
                            <div className="profile-tab">
                                <div className="form-card">
                                    <h3>Manage Home Page Images</h3>
                                    <p className="tab-desc" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Upload your personal photos to be displayed on the home page hero section.</p>
                                    <form onSubmit={handleProfileUpload} className="cv-upload-form" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div className="file-input-wrapper" style={{ flex: 1 }}>
                                            <input 
                                                type="file" 
                                                multiple
                                                onChange={(e) => setProfileImageFiles(Array.from(e.target.files))} 
                                                className="file-input"
                                                style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', width: '100%', color: 'white' }}
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={profileUploading} style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)', border: 'none', padding: '12px 25px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {profileUploading ? 'Uploading...' : <><FaPlus /> Add Images</>}
                                        </button>
                                    </form>
                                </div>

                                <div className="data-list">
                                    <h3>Your Personal Gallery ({profileImages.length})</h3>
                                    <div className="project-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                                        {profileImages.map((img, index) => (
                                            <div key={index} className="dashboard-project-card">
                                                <img src={img} alt="" style={{ height: '150px' }} />
                                                <div className="card-details">
                                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Image {index + 1}</span>
                                                    <div className="card-actions">
                                                        <button onClick={() => handleDeleteProfileImage(img)} className="delete-action"><FaTrash /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
