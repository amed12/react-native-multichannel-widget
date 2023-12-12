import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../state';
import type { User } from '../types';

export function useCurrentUser(): User | undefined {
  return useAtomValue(currentUserAtom);
}
