'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createRoom } from '@/utils/createRoom';

export default function Component() {
  const router = useRouter();

  useEffect(() => {
    const goToRoom = async () => {
      const roomId = await createRoom();
      router.push(`/${roomId}/lobby`);
    };
    goToRoom();
  });
}
