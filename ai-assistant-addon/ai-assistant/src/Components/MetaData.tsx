import React from 'react'
import { TreeDataNode, Tree, TreeProps, Flex } from 'antd'
interface IMetadataProps {
  categoryKeywords: TreeDataNode[]
}
const MetaData = ({ categoryKeywords }: IMetadataProps) => {
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };
  return (
    <Flex style={{ padding: 15, height:"90vh", overflowY:"auto" }}>
      <Tree
        checkable
        onSelect={onSelect}
        onCheck={onCheck}
        treeData={categoryKeywords}
      />
    </Flex>
  )
}

export default MetaData
