import React, { useState, useRef } from 'react';
import { Modal, Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import type { OperationInfo, OperationQueryParams } from '@zyerp/shared';
import operationService from '../../operation/services/operation.service';
import { useMessage } from '@/shared/hooks';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface OperationSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (selectedOperations: OperationInfo[]) => void;
  excludeOperationIds?: string[]; // 排除已选择的工序ID
}

const OperationSelectModal: React.FC<OperationSelectModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  excludeOperationIds = [],
}) => {
  // ProTable 的 formRef 需要 MutableRefObject<ProFormInstance | undefined>
  const formRef = useRef<ProFormInstance<OperationQueryParams> | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<OperationInfo[]>([]);
  const message = useMessage();

  const columns: ProColumns<OperationInfo>[] = [
    {
      title: '工序编码',
      dataIndex: 'code',
      width: 120,
    },
    {
      title: '工序名称',
      dataIndex: 'name',
      width: 160,
    },
    {
      title: '标准工时(分钟)',
      dataIndex: 'standardTime',
      width: 140,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: { text: '启用' },
        false: { text: '停用' },
      },
      render: (_, record) => (record.isActive ? '启用' : '停用'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      search: false,
    },
  ];

  const handleSelectChange = (keys: React.Key[], rows: OperationInfo[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  };

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      message.warning('请至少选择一个工序');
      return;
    }
    onConfirm(selectedRows);
    onCancel();
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <Modal
      title="选择工序"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="确认添加"
      cancelText="取消"
      width={1000}
      // 关闭时销毁内容，避免表单状态残留
      destroyOnHidden
    >
      <ProTable<OperationInfo, OperationQueryParams>
        columns={columns}
        formRef={formRef}
        request={async (params) => {
          try {
            const base = normalizeTableParams(params as unknown as import('@/shared/utils/normalizeTableParams').TableParams)
            const queryParams: OperationQueryParams = {
              page: base.page,
              pageSize: base.pageSize,
              keyword: typeof (params as OperationQueryParams).keyword === 'string' ? params.keyword : undefined,
              isActive: (params as OperationQueryParams).isActive ?? true,
            };
            const response = await operationService.getList(queryParams);
            const data = (response.data || []).filter(op => !excludeOperationIds.includes(op.id));
            return {
              data,
              success: response.success,
              total: response.pagination?.total || 0,
            };
          } catch (error) {
            console.error('获取工序数据失败:', error);
            message.error('获取工序数据失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          collapsed: false,
          collapseRender: false,
          optionRender: () => [
            <Button key="search" type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              查询
            </Button>,
            <Button key="reset" onClick={handleReset}>
              重置
            </Button>,
          ],
          span: 6,
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          defaultPageSize: 10,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectChange,
          getCheckboxProps: (record) => ({
            disabled: excludeOperationIds.includes(record.id),
          }),
        }}
        toolBarRender={false}
        size="small"
        scroll={{ x: 900, y: 420 }}
        options={false}
      />
      <div style={{ marginTop: 16, textAlign: 'right', color: '#666' }}>
        已选择 {selectedRows.length} 个工序
      </div>
    </Modal>
  );
};

export default OperationSelectModal;
