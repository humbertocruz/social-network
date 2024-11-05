import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AdminDashboardClient from './admin';

const AdminDashboard = async () => {
  const user = getSession()
  const users:any = await prisma.user.findMany({
    take:12,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboardClient user={user} users={users} />
    </Suspense>
  )
}

export default AdminDashboard;
