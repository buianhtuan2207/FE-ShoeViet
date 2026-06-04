import React, { useState, useEffect } from 'react';
import styles from './AccountManagement.module.scss';
import { userService } from '../../../../services/UserService';

function AccountManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Thêm các State quản lý bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('Tất cả vai trò');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');

    // Hàm gọi dữ liệu thông qua UserService
    const fetchUsersData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersData();
    }, []);

    // 2. Logic tính toán Thống kê động dựa trên mảng `users` thật
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.enabled).length;
    const blockedUsers = totalUsers - activeUsers;
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    const statsOverview = [
        {
            title: 'Tổng tài khoản',
            value: totalUsers.toLocaleString(),
            icon: 'groups',
            theme: 'primary',
            trend: 'Cập nhật thời gian thực',
            trendType: 'positive',
            trendIcon: 'sync'
        },
        {
            title: 'Đang hoạt động',
            value: activeUsers.toLocaleString(),
            icon: 'check_circle',
            theme: 'success',
            hasProgress: true,
            progressWidth: `${activePercentage}%`
        },
        {
            title: 'Tài khoản bị khóa',
            value: blockedUsers.toLocaleString(),
            icon: 'block',
            theme: 'error',
            trend: totalUsers > 0 ? `${Math.round((blockedUsers / totalUsers) * 100)}% trên tổng hệ thống` : '0%',
            trendType: 'neutral'
        },
        {
            title: 'Tỉ lệ hoạt động',
            value: `${activePercentage}%`,
            icon: 'insights',
            theme: 'tertiary',
            trend: 'Tỉ lệ user khả dụng',
            trendType: 'positive'
        }
    ];

    // 3. Logic xử lý Bộ lọc dữ liệu (Tìm kiếm & Dropdown)
    const filteredUsers = users.filter(user => {
        // Khớp từ khóa tìm kiếm (ID, Tên, Email)
        const matchesSearch =
            String(user.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

        // Khớp vai trò (So khớp chính xác hoặc chữ thường tùy cấu hình DB của bạn)
        const matchesRole =
            selectedRole === 'Tất cả vai trò' ||
            (user.role && user.role.toLowerCase() === selectedRole.toLowerCase());

        // Khớp trạng thái (`user.enabled` là true/false)
        const matchesStatus =
            selectedStatus === 'Tất cả trạng thái' ||
            (selectedStatus === 'Hoạt động' && user.enabled === true) ||
            (selectedStatus === 'Bị khóa' && user.enabled === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <main className={styles.main}>
            <div className={styles.container}>

                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.pageTitle}>Người dùng hệ thống</h1>
                        <p className={styles.pageSubtitle}>Quản lý phân quyền và trạng thái hoạt động của khách hàng & nhân viên.</p>
                    </div>
                    <button className={styles.addBtn}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
                        Thêm người dùng mới
                    </button>
                </div>

                {/* Stats Overview Grid */}
                <div className={styles.statsGrid}>
                    {statsOverview.map((item, idx) => (
                        <div key={idx} className={styles.statCard}>
                            <div>
                                <div className={styles.statHeader}>
                                    <span className={styles.statTitle}>{item.title}</span>
                                    <span className={`${styles.statIcon} ${styles[item.theme]} material-symbols-outlined`}>
                                        {item.icon}
                                    </span>
                                </div>
                                <p className={styles.statValue}>{item.value}</p>
                            </div>

                            {item.hasProgress ? (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar} style={{ width: item.progressWidth }}></div>
                                </div>
                            ) : (
                                item.trend && (
                                    <p className={`${styles.statTrend} ${styles[item.trendType]}`}>
                                        {item.trendIcon && (
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                {item.trendIcon}
                                            </span>
                                        )}
                                        {item.trend}
                                    </p>
                                )
                            )}
                        </div>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className={styles.filtersBar}>
                    <div className={styles.searchWrapper}>
                        <span className={`${styles.searchIcon} material-symbols-outlined`}>search</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm theo tên, email, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.selectInput}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="Tất cả vai trò">Tất cả vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="Nhân viên">Nhân viên</option>
                        <option value="Khách hàng">Khách hàng</option>
                    </select>

                    <select
                        className={styles.selectInput}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Bị khóa">Bị khóa</option>
                    </select>

                    <button className={styles.filterBtn}>
                        <span className="material-symbols-outlined">filter_list</span>
                        Lọc nâng cao
                    </button>

                    <button className={styles.exportBtn} onClick={fetchUsersData} title="Làm mới dữ liệu">
                        <span className="material-symbols-outlined">refresh</span>
                        Làm mới
                    </button>
                </div>

                {/* User Table Card */}
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        {loading && <div className={styles.loadingText} style={{padding: '20px', textAlign: 'center'}}>Đang tải dữ liệu hệ thống...</div>}
                        {error && <div className={styles.errorText} style={{padding: '20px', textAlign: 'center', color: 'red'}}>{error}</div>}

                        {!loading && !error && (
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th className={styles.th}>ID Người dùng</th>
                                    <th className={styles.th}>Họ và Tên</th>
                                    <th className={styles.th}>Email</th>
                                    <th className={styles.th}>Số điện thoại</th>
                                    <th className={styles.th}>Vai trò</th>
                                    <th className={styles.th}>Trạng thái</th>
                                    <th className={`${styles.th} ${styles.alignRight}`}>Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {/* Sử dụng mảng filteredUsers đã qua bộ lọc thay vì mảng gốc users */}
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Không có dữ liệu người dùng nào phù hợp với bộ lọc.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user.id || index} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.mono}`}>#{user.id}</td>
                                            <td className={styles.td}>
                                                <div className={styles.userCell}>
                                                    <span className={styles.userName}>{user.fullName}</span>
                                                </div>
                                            </td>
                                            <td className={`${styles.td} ${styles.subtext}`}>{user.email}</td>
                                            <td className={`${styles.td} ${styles.subtext}`}>{user.phone || 'N/A'}</td>
                                            <td className={`${styles.td} ${styles.subtext}`}>
                                                <span style={{textTransform: 'capitalize'}}>{user.role}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${user.enabled ? styles.active : styles.blocked}`}>
                                                    <span className={styles.dot}></span>
                                                    {user.enabled ? 'Hoạt động' : 'Chưa kích hoạt'}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.alignRight}`}>
                                                <div className={styles.actionsWrapper}>
                                                    <button className={`${styles.actionBtn} ${styles.view}`} title="Xem chi tiết">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                                                    </button>
                                                    <button className={`${styles.actionBtn} ${styles.edit}`} title="Chỉnh sửa">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                                                    </button>

                                                    {!user.enabled ? (
                                                        <button className={`${styles.actionBtn} ${styles.unlock}`} title="Kích hoạt tài khoản">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_open</span>
                                                        </button>
                                                    ) : (
                                                        <button className={`${styles.actionBtn} ${styles.lock}`} title="Khóa/Vô hiệu hóa tài khoản">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>block</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Footer hiển thị số lượng theo bộ lọc */}
                    <div className={styles.pagination}>
                        <p className={styles.pageText}>
                            Hiển thị <strong>1-{filteredUsers.length}</strong> trong số <strong>{filteredUsers.length}</strong> người dùng phù hợp
                        </p>
                        <div className={styles.pageControls}>
                            <button className={`${styles.pageBtn} ${styles.border}`} disabled>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                            </button>
                            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                            <button className={`${styles.pageBtn} ${styles.border}`} disabled>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default AccountManagement;