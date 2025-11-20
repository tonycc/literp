import React from 'react';
import { Modal, Descriptions } from 'antd';
import type { Customer } from '../types';

interface CustomerDetailProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ open, customer, onClose }) => {
  return (
    <Modal title="客户详情" open={open} onCancel={onClose} footer={null} width={800}>
      {customer ? (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="客户编码">{customer.code}</Descriptions.Item>
          <Descriptions.Item label="客户名称">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="分类">{customer.category}</Descriptions.Item>
          <Descriptions.Item label="状态">{customer.status}</Descriptions.Item>
          <Descriptions.Item label="联系人">{customer.contactPerson}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{customer.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{customer.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="地址">{customer.address}</Descriptions.Item>
          <Descriptions.Item label="信用等级">{customer.creditLevel}</Descriptions.Item>
          <Descriptions.Item label="信用额度">{customer.creditLimit ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="税号">{customer.taxNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="银行账户">{customer.bankAccount || '-'}</Descriptions.Item>
          <Descriptions.Item label="开户银行">{customer.bankName || '-'}</Descriptions.Item>
          <Descriptions.Item label="网站">{customer.website || '-'}</Descriptions.Item>
          <Descriptions.Item label="行业">{customer.industry || '-'}</Descriptions.Item>
          <Descriptions.Item label="成立日期">{customer.establishedDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册资本">{customer.registeredCapital ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="营业执照">{customer.businessLicense || '-'}</Descriptions.Item>
          <Descriptions.Item label="法定代表人">{customer.legalRepresentative || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注">{customer.remark || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{customer.createdAt}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{customer.updatedAt}</Descriptions.Item>
        </Descriptions>
      ) : null}
    </Modal>
  );
};

export default CustomerDetail;