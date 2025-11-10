import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import type { ProductInfo } from '@zyerp/shared';
import { useMessage } from '../../../shared/hooks';
import { productService } from '../../product/services/product.service';
import { productCategoryService } from '../../product/services/productCategory.service';
import type { ProductCategoryOption } from '@zyerp/shared';

interface MaterialSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (selectedMaterials: ProductInfo[]) => void;
  excludeProductIds?: string[]; // 排除已选择的产品ID
}

const MaterialSelectModal: React.FC<MaterialSelectModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  excludeProductIds = []
}) => {
  const message = useMessage();
  const formRef = useRef<ProFormInstance | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Record<string, { text: string }>>({});

  // 加载产品类目选项
  useEffect(() => {
    const loadCategoryOptions = async () => {
      try {
        const response = await productCategoryService.getOptions({ isActive: true });
        const options: Record<string, { text: string }> = {};
        
        if (response.data) {
          response.data.forEach((option: ProductCategoryOption) => {
            options[option.value] = { text: option.label };
          });
        }
        
        setCategoryOptions(options);
      } catch (error) {
        console.error('加载产品类目选项失败:', error);
      }
    };

    if (visible) {
      loadCategoryOptions();
    }
  }, [visible]);
  const [selectedRows, setSelectedRows] = useState<ProductInfo[]>([]);

  // 重置选择状态
  const resetSelection = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  // 处理弹窗关闭
  const handleCancel = () => {
    resetSelection();
    onCancel();
  };

  // 表格列定义
  const columns: ProColumns<ProductInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
      search: false,
    },
    {
      title: '产品编码',
      dataIndex: 'code',
      width: 120,
      ellipsis: true,
      search: false,
    },
    {
      title:'产品类目',
      dataIndex: 'categoryId',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      valueEnum: categoryOptions,
      render: (_, record) => record.category?.name || '-',
      fieldProps: {
        placeholder: '请选择产品类目',
      },
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      search: true,
    },
    {
      title: '产品类型',
      dataIndex: 'type',
      width: 100,
      valueEnum: {
        raw_material: { text: '原材料', status: 'Default' },
        semi_finished_product: { text: '半成品', status: 'Processing' },
        finished_product: { text: '成品', status: 'Success' },
      },
    },
    {
      title: '规格',
      dataIndex: 'specification',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '主单位',
      dataIndex: 'unit',
      width: 80,
      render: (_, record) => record.unit?.name || '-',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      search: false, // 隐藏状态搜索，因为只显示启用状态
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
        draft: { text: '草稿', status: 'Warning' },
      },
    },
  ];

  // 处理行选择
  const handleSelectChange = (selectedRowKeys: React.Key[], selectedRows: ProductInfo[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      message.warning('请至少选择一个物料');
      return;
    }
    onConfirm(selectedRows);
    onCancel(); // 关闭弹窗
  };

  return (
    <Modal
      title="选择物料"
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      width={1000}
      okText="确认添加"
      cancelText="取消"
      destroyOnHidden
      afterClose={resetSelection}
    >
      <ProTable<ProductInfo>
        columns={columns}
        formRef={formRef}
        request={async (params) => {
          try {
            const queryParams = {
              page: params.current || 1,
              pageSize: params.pageSize || 10,
              name: params.name,
              code: params.code,
              categoryId: params.categoryId,
              type: params.type,
              status: params.status || 'active', // 默认只显示启用状态的物料
              keyword: params.keyword,
            };
            const response = await productService.getProducts(queryParams);
            // 过滤掉已排除的产品
            const filteredData = (response.data || []).filter(product => 
              !excludeProductIds.includes(product.id)
            );
            
            return {
              data: filteredData,
              success: response.success,
              total: response.pagination?.total || 0,
            };
          } catch (error) {
            console.error('获取产品数据失败:', error);
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
            <Button 
              key="reset" 
              onClick={() => {
                formRef.current?.resetFields();
              }}
            >
              重置
            </Button>,
          ],
          span: 6, // 调整搜索表单的列宽，使按钮与搜索条件在同一行
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
            disabled: excludeProductIds.includes(record.id),
          }),
        }}
        toolBarRender={false}
        size="small"
        scroll={{ x: 800, y: 400 }}
        options={false}
      />
      <div style={{ marginTop: 16, textAlign: 'right', color: '#666' }}>
        已选择 {selectedRows.length} 个物料
      </div>
    </Modal>
  );
};

export default MaterialSelectModal;