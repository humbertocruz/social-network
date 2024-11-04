import React from 'react';
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
const EditUserPage = async ({ params }: { params: { id: string } }) => {
  const user = await getUser(params.id);
  return (
    <UserForm user={user} />
  );
};

export default EditUserPage;