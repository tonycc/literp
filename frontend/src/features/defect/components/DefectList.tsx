import React from 'react';
import { Button, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { DefectService } from '../services/defect.service';
import type { Defect } from '../services/defect.service';

interface DefectListProps {
  actionRef: React.MutableRefObject<ActionType | undefined>;
  onAdd: () => void;
  onEdit: (item: Defect) => void;
  onDelete: (id: string) => Promise<void>;
}

export const DefectList: React.FC<DefectListProps> = ({
  actionRef,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const columns: ProColumns<Defect>[] = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      tooltip: '搜索代码或名称',
    },
    {
      title: '不良品项代码',
      dataIndex: 'code',
      copyable: true,
      width: 150,
      search: false,
    },
    {
      title: '不良品项名称',
      dataIndex: 'name',
      copyable: true,
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      valueType: 'select',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '停用', status: 'Error' },
      },
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => onEdit(record)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除吗?"
          onConfirm={() => { void onDelete(record.id); }}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<Defect>
      headerTitle="不良品项列表"
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 120,
      }}
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          type="primary"
          onClick={onAdd}
        >
          新建
        </Button>,
      ]}
      request={async (params) => {
        const { current, pageSize, keyword, isActive } = params;
        const result = await DefectService.getList({
          current,
          pageSize,
          keyword: keyword as string,
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
        return {
          data: result.data,
          success: result.success,
          total: result.total,
        };
      }}
      columns={columns}
    />
  );
};
