'use server'
import { prisma } from "@/lib/prisma";
 
export async function likePost(postId:string, userId:string) {
    // Check if like exists
    const existingLike = await prisma.like.findFirst({
    where: {
        postId,
        userId,
    },
    });

    let action;

    if (existingLike) {
    // Unlike
    await prisma.like.delete({
        where: {
        id: existingLike.id,
        },
    });
    action = 'unliked';
    } else {
    // Like
    await prisma.like.create({
        data: {
            postId,
            userId,
        },
    });
    action = 'liked';
    }

    return action
}