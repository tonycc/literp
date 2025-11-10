import React from 'react';
import { 
  DragSortTable
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Popconfirm, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import type { RoutingWorkcenterInfo, WorkcenterOption } from '@zyerp/shared';
import { useMessage } from '../../../shared/hooks';

interface RoutingOperationsListProps {
  dataSource?: RoutingWorkcenterInfo[];
  onAdd?: () => void;
  onEdit?: (record: RoutingWorkcenterInfo) => void;
  onDelete?: (id: string) => void;
  onSort?: (data: RoutingWorkcenterInfo[]) => void;
  workcenterOptions?: WorkcenterOption[];
  onChangeWorkcenter?: (id: string, workcenterId: string) => void;
}

const RoutingOperationsList: React.FC<RoutingOperationsListProps> = ({
  dataSource = [],
  onAdd,
  onDelete,
  onSort,
  workcenterOptions = [],
  onChangeWorkcenter,
}) => {
  const messageApi = useMessage();

  // 删除工艺路线作业
  const handleDelete = async (id: string) => {
    try {
      onDelete?.(id);
      messageApi.success('删除成功');
    } catch (error) {
      console.error('删除工艺路线作业失败:', error);
      messageApi.error('删除失败');
    }
  };

  // 表格列定义
  const columns: ProColumns<RoutingWorkcenterInfo>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
      render: () => (
        <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
      ),
    },
    {
      title: '工序名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '工作中心',
      dataIndex: 'workcenterId',
      width: 180,
      render: (_, record) => (
        <Select
          value={record.workcenterId}
          placeholder="请选择工作中心"
          style={{ width: '100%' }}
          options={(workcenterOptions || []).map((opt) => ({
            label: `${opt.label}`,
            value: opt.value,
          }))}
          onChange={(val) => onChangeWorkcenter?.(record.id, val)}
        />
      )
    },
    {
      title: '标准工时',
      dataIndex: 'timeCycleManual',
      width: 120,
      render: (_, record) => `${record.timeCycleManual} 分钟`
    },
    {
      title: '工价',
      dataIndex: 'wageRate',
      width: 120,
      search: false,
      valueType: 'digit',
      renderText: (text) =>
        typeof text === 'number' ? text.toFixed(2) : '0.00',
    },
   
    {
      title: '操作',
      width: 150,
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个工序吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          添加工序
        </Button>
      </div>
      <DragSortTable<RoutingWorkcenterInfo>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        dragSortKey="sort"
        onDragSortEnd={(oldIndex, newIndex, newData) => {
          onSort?.(newData as RoutingWorkcenterInfo[]);
        }}
        pagination={false}
        search={false}
        options={false}
      />
    </div>
  );
};

export default RoutingOperationsList;