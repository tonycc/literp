import React from 'react'
import { useLocation } from 'react-router-dom'
import WorkOrderSchedulingList from '../components/WorkOrderSchedulingList'

export const WorkOrderScheduling: React.FC = () => {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const presetMoId = search.get('moId') || undefined
  return <WorkOrderSchedulingList presetMoId={presetMoId} />
}

export default WorkOrderScheduling