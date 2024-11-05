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
    const cookiesVars = await cookies()
    const token = cookiesVars.get('token')?.value
    // Construct the URL using the URL API
    const url = new URL('/api/dashboard', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'GET',
      cache: 'no-store'
    })
    if (!response.ok) throw new Error('Failed to fetch dashboard data')
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

export const revalidate = 0

export default async function DashboardPage() {
  const data = await fetchDashboardData()
  const user = getSession()
  return null
  return (
    <Suspense fallback={
      <></>
    }>
    <DashboardClient data={data} user={user} />
    </Suspense>
  )
}