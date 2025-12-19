import React, { useRef, useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDatePicker,
  ProFormDependency,
  ProTable,
} from '@ant-design/pro-components';
import type { ProFormInstance, ProColumns } from '@ant-design/pro-components';
import { Card, Row, Col, InputNumber, Select } from 'antd';
import { salesReceiptService } from '../services/sales-receipt.service';
import { salesOrderService } from '../../sales-order/services/sales-order.service';
import { customerService } from '@/features/customer-management/services/customer.service';
import authService from '@/features/auth/services/auth.service';
import userService from '@/features/user-management/services/user.service';
import type {
  CreateSalesReceiptDto,
  CreateSalesReceiptItemDto,
  SalesOrderItem,
} from '@zyerp/shared';
import { useMessage } from '@/shared/hooks/useMessage';
import { useWarehouseOptions } from '@/shared/hooks/useWarehouseOptions';
import dayjs from 'dayjs';

interface SalesReceiptFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onSuccess: () => void;
}

export const SalesReceiptForm: React.FC<SalesReceiptFormProps> = ({
  visible,
  onVisibleChange,
  onSuccess,
}) => {
  const formRef = useRef<ProFormInstance<CreateSalesReceiptDto> | undefined>(undefined);
  const message = useMessage();
  const { options: warehouseOptions } = useWarehouseOptions({ isActive: true });
  const [items, setItems] = useState<CreateSalesReceiptItemDto[]>([]);

  useEffect(() => {
    if (!visible) {
      formRef.current?.resetFields();
      setItems([]);
    } else {
      const initHandler = async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user?.username) {
            formRef.current?.setFieldsValue({ handler: user.username });
          }
        } catch (error) {
          console.error('Failed to fetch current user', error);
        }
      };
      void initHandler();
    }
  }, [visible]);

  const handleOrderChange = async (orderId: string) => {
    if (!orderId) {
      setItems([]);
      return;
    }
    try {
      const response = await salesOrderService.getById(orderId);
      if (response.success && response.data) {
        const order = response.data;
        const mappedItems: CreateSalesReceiptItemDto[] = (order.items || []).map((item: SalesOrderItem) => ({
          salesOrderItemId: item.id,
          productId: item.productId,
          productName: item.product?.name || '',
          productCode: item.product?.code || '',
          quantity: item.quantity,
          unitPrice: item.price || 0,
          amount: (item.quantity || 0) * (item.price || 0),
          warehouseId: item.warehouseId,
          remarks: item.remark,
        }));
        formRef.current?.setFieldsValue({
          customerName: order.customerName,
          salesOrderNo: order.orderNo,
        });
        setItems(mappedItems);
      }
    } catch (error) {
      console.error(error);
      message.error('获取订单详情失败');
    }
  };

  const handleQuantityChange = (rowId: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.salesOrderItemId === rowId ? { ...item, quantity: value } : item,
      ),
    );
  };

  const handleWarehouseChange = (rowId: string, value?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.salesOrderItemId === rowId ? { ...item, warehouseId: value } : item,
      ),
    );
  };

  const columns: ProColumns<CreateSalesReceiptItemDto>[] = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      readonly: true,
      width: '20%',
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      readonly: true,
      width: '15%',
    },
    {
      title: '本次出库数量',
      dataIndex: 'quantity',
      width: '15%',
      render: (_, record) => (
        <InputNumber
          min={1}
          precision={0}
          value={record.quantity}
          onChange={(value) =>
            handleQuantityChange(
              record.salesOrderItemId,
              typeof value === 'number' ? value : record.quantity,
            )
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      valueType: 'money',
      readonly: true,
      width: '15%',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      valueType: 'money',
      readonly: true,
      width: '15%',
      render: (_, row) => {
        const amount = (row.quantity || 0) * (row.unitPrice || 0);
        return `¥${amount.toFixed(2)}`;
      },
      editable: false,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseId',
      width: '20%',
      render: (_, record) => (
        <Select
          options={warehouseOptions}
          value={record.warehouseId}
          onChange={(value) => handleWarehouseChange(record.salesOrderItemId, value)}
          style={{ width: '100%' }}
          allowClear
          placeholder="请选择仓库"
        />
      ),
    },
  ];

  return (
    <ModalForm<CreateSalesReceiptDto>
      title="新建销售出库单"
      open={visible}
      onOpenChange={onVisibleChange}
      formRef={formRef}
      width={1200}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={{
        receiptDate: dayjs().format('YYYY-MM-DD'),
      }}
      onFinish={async (values: CreateSalesReceiptDto) => {
        if (!items.length) {
          message.error('请先选择出库明细');
          return false;
        }
        for (const it of items) {
          if (!it.quantity || it.quantity <= 0) {
            message.error('请填写出库数量');
            return false;
          }
          if (!it.warehouseId) {
            message.error('请选择仓库');
            return false;
          }
        }
        const submitData: CreateSalesReceiptDto = {
          salesOrderId: values.salesOrderId,
          salesOrderNo: values.salesOrderNo || '',
          customerName: values.customerName || '',
          receiptDate: values.receiptDate,
          handler: values.handler,
          remarks: values.remarks,
          items: items.map((item) => ({
            salesOrderItemId: item.salesOrderItemId,
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            warehouseId: item.warehouseId,
            remarks: item.remarks,
          })),
        };

        try {
          await salesReceiptService.create(submitData);
          message.success('创建成功');
          onSuccess();
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }}
    >
      <Card size="small" title="基础信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormSelect
              name="customerName"
              label="客户"
              showSearch
              rules={[{ required: true, message: '请选择客户' }]}
              request={async (params) => {
                const { keyWords } = params as { keyWords?: string };
                const res = await customerService.getCustomerOptions({
                  keyword: keyWords,
                  activeOnly: true,
                });
                return (res.data || []).map((c) => ({
                  label: c.name,
                  value: c.name,
                }));
              }}
              fieldProps={{
                showSearch: true,
                filterOption: (input, option) => {
                  const label = (option as { label?: unknown } | undefined)?.label;
                  return (
                    typeof label === 'string' &&
                    label.toLowerCase().includes(input.toLowerCase())
                  );
                },
                onChange: () => {
                  formRef.current?.setFieldsValue({
                    salesOrderId: undefined,
                    salesOrderNo: '',
                  });
                  setItems([]);
                },
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormDependency name={['customerName']}>
              {({ customerName }) => (
                <ProFormSelect
                  name="salesOrderId"
                  label="销售订单"
                  rules={[{ required: true }]}
                  params={{ customerName }}
                  disabled={!customerName}
                  request={async (params) => {
                    const { customerName: cName, keyWords } = params as {
                      customerName?: string;
                      keyWords?: string;
                    };
                    if (!cName) {
                      return [];
                    }
                    const res = await salesOrderService.getSalesOrders({
                      orderNumber: keyWords,
                      customerName: cName,
                      page: 1,
                      pageSize: 20,
                    });
                    return (res.data || []).map((item) => ({
                      label: `${item.orderNo} - ${item.customerName}`,
                      value: item.id,
                    }));
                  }}
                  fieldProps={{
                    onChange: (val) => {
                      const value = typeof val === 'string' ? val : undefined;
                      formRef.current?.setFieldsValue({ salesOrderId: value });
                      if (value) {
                        void handleOrderChange(value);
                      } else {
                        setItems([]);
                      }
                    },
                    showSearch: true,
                  }}
                />
              )}
            </ProFormDependency>
            <ProFormText name="salesOrderNo" hidden />
          </Col>
           <Col span={4}>
            <ProFormSelect
              name="handler"
              label="经办人"
              showSearch
              request={async (params) => {
                const { keyWords } = params as { keyWords?: string };
                const res = await userService.getUsers({
                  page: 1,
                  limit: 50,
                  search: keyWords,
                });
                return (res.data || []).map((u) => ({
                  label: u.username,
                  value: u.username,
                }));
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormDatePicker
              name="receiptDate"
              label="出库日期"
              rules={[{ required: true }]}
              width="100%"
            />
          </Col>
         
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <ProFormTextArea name="remarks" label="备注" />
          </Col>
        </Row>
      </Card>

      <Card size="small" title="出库明细">
        <ProTable<CreateSalesReceiptItemDto>
          columns={columns}
          dataSource={items}
          rowKey="salesOrderItemId"
          search={false}
          pagination={false}
          toolBarRender={false}
          size="small"
        />
      </Card>
    </ModalForm>
  );
};
