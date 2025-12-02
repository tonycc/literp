import React from 'react';
import { Modal, Form, Checkbox, InputNumber, Row, Col } from 'antd';

interface BomItemBatchModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: { scrapRate?: number; fixedScrap?: number }) => void;
}

const BomItemBatchModal: React.FC<BomItemBatchModalProps> = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [updateScrapRate, setUpdateScrapRate] = React.useState(false);
  const [updateFixedScrap, setUpdateFixedScrap] = React.useState(false);

  const handleOk = () => {
    form.validateFields()
      .then((values: { scrapRate: number; fixedScrap: number }) => {
        const result: { scrapRate?: number; fixedScrap?: number } = {};
        
        if (updateScrapRate) {
          result.scrapRate = values.scrapRate;
        }
        if (updateFixedScrap) {
          result.fixedScrap = values.fixedScrap;
        }
        
        onOk(result);
        form.resetFields();
        setUpdateScrapRate(false);
        setUpdateFixedScrap(false);
      })
      .catch((error: unknown) => {
        console.error('Validate Failed:', error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setUpdateScrapRate(false);
    setUpdateFixedScrap(false);
    onCancel();
  };

  return (
    <Modal
      title="批量设置损耗"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16} align="middle">
          <Col span={2}>
            <Checkbox 
              checked={updateScrapRate} 
              onChange={(e) => setUpdateScrapRate(e.target.checked)} 
            />
          </Col>
          <Col span={22}>
            <Form.Item
              name="scrapRate"
              label="损耗率 (%)"
              initialValue={0}
            >
              <InputNumber
                min={0}
                max={100}
                precision={2}
                style={{ width: '100%' }}
                disabled={!updateScrapRate}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} align="middle">
          <Col span={2}>
            <Checkbox 
              checked={updateFixedScrap} 
              onChange={(e) => setUpdateFixedScrap(e.target.checked)} 
            />
          </Col>
          <Col span={22}>
            <Form.Item
              name="fixedScrap"
              label="固定损耗"
              initialValue={0}
            >
              <InputNumber
                min={0}
                precision={4}
                style={{ width: '100%' }}
                disabled={!updateFixedScrap}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default BomItemBatchModal;
