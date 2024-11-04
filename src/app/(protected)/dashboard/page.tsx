// src/app/(protected)/dashboard/page.tsx
import { Suspense } from 'react'
import { useAuth } from '@/providers/auth-provider'

import DashboardClient from './dashboardClient';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

interface Post {
  id: string
  content: string
  images: Array<{
    id: string
    url: string
  }>
  createdAt: string
  user: {
    id: string
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
  _count: {
    likes: number
    comments: number
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
  read: boolean
}

const fetchDashboardData = async () => {
  try {
    const session =  await getSession()
    const token = cookies().get('token')?.value
    const response = await fetch('http://localhost:3000/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch dashboard data')
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

export default async function DashboardPage() {
  const data = await fetchDashboardData()
  const user = getSession()
  return (
    <Suspense fallback={
      <></>
    }>
    <DashboardClient data={data} user={user} />
    </Suspense>
  )
}