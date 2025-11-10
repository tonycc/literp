import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { BellOutlined, SoundOutlined, MessageOutlined } from '@ant-design/icons';
import NotificationCenter from '../components/NotificationCenter';
import AnnouncementManagement from '../components/AnnouncementManagement';
import MessageManagement from '../components/MessageManagement';

const NotificationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div style={{ padding: 0 }}>
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined />
                  通知中心
                </span>
              ),
              children: <NotificationCenter isOpen={true} onClose={() => {}} embedded={true} />
            },
            {
              key: 'announcements',
              label: (
                <span>
                  <SoundOutlined />
                  公告管理
                </span>
              ),
              children: <AnnouncementManagement />
            },
            {
              key: 'messages',
              label: (
                <span>
                  <MessageOutlined />
                  消息管理
                </span>
              ),
              children: <MessageManagement />
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default NotificationManagement;