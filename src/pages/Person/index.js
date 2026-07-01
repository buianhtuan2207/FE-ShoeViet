import React, { useState, useEffect } from 'react';
import styles from './Person.module.scss';
import { userService } from '../../services/UserService';

// Import các component con
import Sidebar from './components/Sidebar';
import ChangePassword from './tabs/ChangePassword';
import Info from './tabs/Info'; // Thêm import này

const Person = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await userService.getMyProfile();
                setFormData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateProfile(formData);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem', fontWeight: 'bold' }}>
                Đang tải dữ liệu...
            </div>
        );
    }

    // Router nội bộ để quyết định render tab nào
    const renderContent = () => {
        switch (activeTab) {
            case 'password':
                return <ChangePassword />;
            case 'profile':
            default:
                // Truyền props xuống cho tab Info
                return (
                    <Info
                        formData={formData}
                        onChange={handleProfileChange}
                        onSubmit={handleProfileSubmit}
                    />
                );
        }
    };

    return (
        <main className={styles.mainContainer}>
            <Sidebar
                userName={formData.fullName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <section className={styles.contentArea}>
                {renderContent()}
            </section>
        </main>
    );
};

export default Person;