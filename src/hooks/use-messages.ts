import { useMemo } from 'react';
import { messagesAtom, roomIdAtom } from '../state';
import { useAtomValue } from 'jotai';

export function useMessages() {
  const messages_: Record<string, { chatRoomId: string; timestamp: Date }> = useAtomValue(messagesAtom);
  const roomId = useAtomValue(roomIdAtom);
  const messages = useMemo(() => {
    return Object.values(messages_)
      .filter((it) => it.chatRoomId === String(roomId))
      .sort((m1, m2) => m1.timestamp.getTime() - m2.timestamp.getTime());
  }, [messages_, roomId]);

  return messages;
}
