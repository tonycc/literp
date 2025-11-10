/**
 * 部门树组件
 */

import React, { useState, useEffect } from 'react';
import {
  Tree,
  Card,
  Input,

  Spin,
} from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import { useDepartmentTree } from '../hooks/useDepartments';
import type { DepartmentTreeNode } from '@zyerp/shared';


interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  data: DepartmentTreeNode;
}
const { Search } = Input;

interface DepartmentTreeProps {
  onSelect?: (department: DepartmentTreeNode) => void;
}

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  onSelect,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const { tree, loading } = useDepartmentTree();

  // 获取所有节点的 key
  const getAllKeys = (nodes: DepartmentTreeNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach(node => {
      keys.push(String(node.id));
      if (node.children && node.children.length > 0) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  // 当树数据加载完成后，默认展开所有节点
  useEffect(() => {
    if (tree && tree.length > 0) {
      const allKeys = getAllKeys(tree);
      setExpandedKeys(allKeys);
      setAutoExpandParent(true);
    }
  }, [tree]);

  // 转换树数据格式
  const convertTreeData = (nodes: DepartmentTreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      title: node.name,
      key: String(node.id),
      children: node.children ? convertTreeData(node.children) : undefined,
      data: node,
    }));
  };

  // 搜索功能
  const handleSearch = (value: string) => {
    if (value) {
      // 简单的搜索实现，展开所有节点
      setExpandedKeys(getAllKeys(tree));
      setAutoExpandParent(true);
    } else {
      // 搜索清空时，恢复默认展开状态
      setExpandedKeys(getAllKeys(tree));
      setAutoExpandParent(true);
    }
  };

  // 树节点事件处理
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[]);
    setAutoExpandParent(false);
  };

  const handleSelect = (selectedKeys: React.Key[], info: { node: TreeNode }) => {
    setSelectedKeys(selectedKeys as string[]);
    if (selectedKeys.length > 0 && info.node?.data) {
      onSelect?.(info.node.data);
    }
  };

  const treeData = convertTreeData(tree);

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        

        <Search
          placeholder="搜索部门"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => !e.target.value && handleSearch('')}
        />
      </div>

      <Spin spinning={loading}>
        <Tree
          showLine
          treeData={treeData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          autoExpandParent={autoExpandParent}
          onExpand={handleExpand}
          onSelect={handleSelect}
          height={400}
          style={{ marginTop: 16 }}
        />
      </Spin>
    </Card>
  );
};