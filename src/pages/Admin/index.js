import React, { useState } from 'react';
import styles from './Admin.module.scss';

// Import các components cấu trúc
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

// Import các tabs nội dung
import Dashboard from './tabs/Dashboard';
import AccountManagement from "./tabs/AccountManagement";
import ProductManagement from "./tabs/ProductManagement";
import CouponManagement from "./tabs/CouponManagement";
import OrderManagement from "./tabs/OrderManagement";
import CategoryManagement from "./tabs/CategoryManagement";

function Admin() {
    // Quản lý trạng thái tab đang active (mặc định là 'dashboard')
    const [currentTab, setCurrentTab] = useState('dashboard');

    // Hàm render nội dung tab dựa trên state
    const renderTabContent = () => {
        switch (currentTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'accounts':
              return <AccountManagement />;
            case 'products':
              return <ProductManagement />;
            case 'categories':
                return <CategoryManagement />
            case 'coupons':
                return <CouponManagement />
            case 'orders':
                return <OrderManagement />
            default:
                return <Dashboard />;
        }
    };

    // Xác định tiêu đề cho Header dựa trên tab hiện tại
    const getHeaderTitle = () => {
        switch (currentTab) {
            case 'dashboard': return 'Bảng điều khiển';
            case 'accounts': return 'Quản lý tài khoản';
            case 'products': return 'Quản lý sản phẩm';
            case 'categories': return 'Quản lý danh mục'
            case 'coupons': return 'Quản lý mã giảm giá';
            case 'orders': return 'Quản lý hóa đơn';
            default: return 'Bảng điều khiển';
        }
    };

    return (
        <div className={styles.adminLayout}>

            <AdminSidebar
                currentTab={currentTab}
                onChangeTab={setCurrentTab}
            />

            <AdminHeader title={getHeaderTitle()} />

            {renderTabContent()}

        </div>
    );
};

export default Admin;