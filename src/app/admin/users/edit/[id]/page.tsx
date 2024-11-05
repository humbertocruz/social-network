import React, { Suspense } from 'react';
import UserForm from './userForm';
import { prisma } from '@/lib/prisma';

const getUser = async (id:string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id
    }
  })
  return user
}

export const revalidate = 0

const EditUserPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  const user = await getUser(id);
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserForm user={user} />
    </Suspense>
  );
};

export default EditUserPage;