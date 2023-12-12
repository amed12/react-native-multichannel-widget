import { useAtomValue } from 'jotai';
import { qiscusAtom } from '../state';

export function useQiscus() {
  return useAtomValue(qiscusAtom);
}
