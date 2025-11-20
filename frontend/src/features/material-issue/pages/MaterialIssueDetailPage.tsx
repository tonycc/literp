import React from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { useParams } from 'react-router-dom'
import MaterialIssueDetail from '../components/MaterialIssueDetail'

const MaterialIssueDetailPage: React.FC = () => {
  const params = useParams()
  const id = params.id as string
  return (
    <PageContainer title="领料订单详情">
      <MaterialIssueDetail orderId={id} />
    </PageContainer>
  )
}

export default MaterialIssueDetailPage