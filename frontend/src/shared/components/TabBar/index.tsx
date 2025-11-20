import React, { useState, useEffect, useCallback } from 'react';
import { Tabs } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuDataItem } from '@ant-design/pro-layout';
import './index.css';

interface TabItem {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  closable?: boolean;
}

interface TabBarProps {
  menuData: MenuDataItem[];
}

const TabBar: React.FC<TabBarProps> = ({ menuData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/', label: '首页', path: '/', closable: false }
  ]);
  const [activeKey, setActiveKey] = useState<string>('/');

  // 根据路径获取菜单项信息（支持嵌套菜单）
  const getMenuItemByPath = useCallback((path: string): MenuDataItem | undefined => {
    const findMenuItem = (items: MenuDataItem[]): MenuDataItem | undefined => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = findMenuItem(item.children);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };
    
    return findMenuItem(menuData);
  }, [menuData]);

  // 添加标签页
  const addTab = useCallback((path: string) => {
    const menuItem = getMenuItemByPath(path);
    if (!menuItem) return;

    const newTab: TabItem = {
      key: path,
      label: menuItem.name || '未知页面',
      path: path,
      icon: menuItem.icon,
      closable: path !== '/dashboard', // 仪表板不可关闭
    };

    setTabs(prevTabs => {
      const existingTab = prevTabs.find(tab => tab.key === path);
      if (existingTab) {
        return prevTabs;
      }
      return [...prevTabs, newTab];
    });
  }, [getMenuItemByPath]);

  

  // 移除标签页
  const removeTab = useCallback((targetKey: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.key !== targetKey);
      
      // 如果关闭的是当前激活的标签页，需要切换到其他标签页
      if (targetKey === activeKey && newTabs.length > 0) {
        const newActiveKey = newTabs[newTabs.length - 1].key;
        setActiveKey(newActiveKey);
        void navigate(newActiveKey);
      }
      
      return newTabs;
    });
  }, [activeKey, navigate]);

  // 标签页切换
  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
    void navigate(key);
  }, [navigate]);

  // 初始化标志
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化默认标签页
  useEffect(() => {
    addTab('/dashboard');
    setIsInitialized(true);
  }, [addTab]);

  // 监听路由变化
  useEffect(() => {
    // 跳过初始化阶段的路径变化
    if (!isInitialized) {
      return;
    }
    
    const currentPath = location.pathname;
    setActiveKey(currentPath);
    addTab(currentPath);
  }, [location.pathname, isInitialized, addTab]);

  const items = tabs.map(tab => ({
    key: tab.key,
    label: (
      <div className="tab-label">
        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
        <span className="tab-text">{tab.label}</span>
      </div>
    ),
    closable: !!tab.closable,
  }));

  if (tabs.length === 0) return null;

  return (
    <div className="header-tab-bar">
      <Tabs
        type="editable-card"
        size="large"
        activeKey={activeKey}
        onChange={handleTabChange}
        onEdit={(targetKey, action) => {
          if (action === 'remove' && typeof targetKey === 'string') {
            removeTab(targetKey);
          }
        }}
        items={items}
        hideAdd
      />
    </div>
  );
};

export default TabBar;