'use server'
import { prisma } from '@/lib/prisma';

const setUserAndProfiles = async (user:any) => {
  const data = prisma.user.update({
    data: {
      updatedAt: new Date()
    },
    where: {
      id: user.id,
    }
  });
  return data
}
export default setUserAndProfiles
