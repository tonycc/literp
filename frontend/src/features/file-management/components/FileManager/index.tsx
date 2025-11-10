/**
 * 文件管理页面
 */

import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Space, Typography, Divider } from 'antd';
import { FileOutlined, UserOutlined } from '@ant-design/icons';
import { AvatarUpload, DocumentUpload } from '../Upload';
import type { UploadedFile } from '../../services/upload.service';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const FileManager: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  const handleDocumentsChange = (files: UploadedFile[]) => {
    setDocuments(files);
  };

  return (
    <div style={{ padding: 0 }}>
      <Card>
        <Tabs defaultActiveKey="avatar" size="large">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              头像管理
            </span>
          }
          key="avatar"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                title="用户头像"
                bordered={false}
                style={{ textAlign: 'center' }}
                styles={{ body: { padding: 12 } }}
              >
                <AvatarUpload
                  value={avatarUrl}
                  onChange={handleAvatarChange}
                  size={120}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={16} lg={18}>
              <Card title="使用说明" bordered={false} styles={{ body: { padding: 12 } }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>支持格式</Title>
                    <Paragraph>
                      支持 JPG、JPEG、PNG、GIF 等常见图片格式
                    </Paragraph>
                  </div>
                  <div>
                    <Title level={5}>文件大小</Title>
                    <Paragraph>
                      单个文件大小不能超过 2MB
                    </Paragraph>
                  </div>
                  <div>
                    <Title level={5}>建议尺寸</Title>
                    <Paragraph>
                      建议上传正方形图片，推荐尺寸 200x200 像素或更高
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileOutlined />
              文档管理
            </span>
          }
          key="documents"
        >
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="文档上传" bordered={false}>
                <DocumentUpload
                  value={documents}
                  onChange={handleDocumentsChange}
                  maxCount={20}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="使用说明" bordered={false}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div>
                      <Title level={5}>支持格式</Title>
                      <Paragraph>
                        • PDF 文档 (.pdf)<br />
                        • Word 文档 (.doc, .docx)<br />
                        • Excel 表格 (.xls, .xlsx)<br />
                        • 文本文件 (.txt)<br />
                        • 图片文件 (.jpg, .png, .gif)
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div>
                      <Title level={5}>文件限制</Title>
                      <Paragraph>
                        • 单个文件不超过 5MB<br />
                        • 最多上传 20 个文件<br />
                        • 支持批量上传<br />
                        • 自动去重处理
                      </Paragraph>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div>
                      <Title level={5}>功能特性</Title>
                      <Paragraph>
                        • 在线预览支持<br />
                        • 一键下载文件<br />
                        • 文件信息查看<br />
                        • 安全删除操作
                      </Paragraph>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>
        </Tabs>

      </Card>

      
    </div>
  );
};

export default FileManager;