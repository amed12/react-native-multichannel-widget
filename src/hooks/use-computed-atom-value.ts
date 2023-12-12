import { atom, Getter, useAtom, useAtomValue } from 'jotai';

export function useComputedAtomValue<R>(cb: (get: Getter) => R) {
  return useAtomValue(atom(cb));
}

export function useComputedAtom<R>(cb: (get: Getter) => R) {
  return useAtom(atom(cb));
}
