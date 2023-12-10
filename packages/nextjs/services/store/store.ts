import create from "zustand";
import { BetInterface } from "~~/components/PlaceBet";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  isPlaceBetModalOpen: boolean;
  setPlaceBetModalOpen: (isOpen: boolean) => void;
  placeBetModalData?: BetInterface;
  setPlaceBetModalData: (data?: BetInterface) => void;
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  isPlaceBetModalOpen: false,
  setPlaceBetModalOpen: (isOpen: boolean) => set(() => ({ isPlaceBetModalOpen: isOpen })),
  placeBetModalData: undefined,
  setPlaceBetModalData: (data?: BetInterface) => set(() => ({ placeBetModalData: data })),
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number) => set(() => ({ nativeCurrencyPrice: newValue })),
}));
