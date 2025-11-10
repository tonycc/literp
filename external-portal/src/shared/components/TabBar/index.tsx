import React, { useState, useEffect } from 'react';
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
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  // 根据路径查找菜单项
  const getMenuItemByPath = (path: string): MenuDataItem | null => {
    const findMenuItem = (items: MenuDataItem[]): MenuDataItem | null => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findMenuItem(menuData);
  };

  // 添加标签页
  const addTab = (path: string) => {
    const menuItem = getMenuItemByPath(path);
    if (!menuItem) return;

    const newTab: TabItem = {
      key: path,
      label: menuItem.name || '未知页面',
      path: path,
      icon: menuItem.icon,
      closable: true, // 所有标签页都可关闭
    };

    setTabs(prevTabs => {
      const existingTab = prevTabs.find(tab => tab.key === path);
      if (existingTab) {
        return prevTabs;
      }
      return [...prevTabs, newTab];
    });
  };

  // 移除标签页
  const removeTab = (targetKey: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.key !== targetKey);
      
      // 如果关闭的是当前激活的标签页，需要切换到其他标签页
      if (targetKey === activeKey && newTabs.length > 0) {
        const newActiveKey = newTabs[newTabs.length - 1].key;
        setActiveKey(newActiveKey);
        navigate(newActiveKey);
      }
      
      return newTabs;
    });
  };

  // 标签页切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    navigate(key);
  };

  // 监听路由变化
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveKey(currentPath);
    addTab(currentPath);
  }, [location.pathname]);

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