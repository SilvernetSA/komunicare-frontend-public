import type { StateCreator } from 'zustand';

export type StoreSet<TStore> = Parameters<StateCreator<TStore>>[0];
export type StoreGet<TStore> = Parameters<StateCreator<TStore>>[1];

export type StoreActionsFactory<TStore, TActions> = (
  set: StoreSet<TStore>,
  get: StoreGet<TStore>,
) => TActions;

export const createStoreActions = <TStore, TActions>(
  factory: StoreActionsFactory<TStore, TActions>,
): StoreActionsFactory<TStore, TActions> => factory;
