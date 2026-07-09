import { create } from 'zustand'

export type ConfirmVariant = 'danger' | 'default'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  requireInput?: boolean
  inputLabel?: string
  inputPlaceholder?: string
  onConfirm: (inputValue?: string) => void | Promise<void>
}

interface ConfirmStore {
  open: boolean
  loading: boolean
  options: ConfirmOptions | null
  request: (options: ConfirmOptions) => void
  close: () => void
  setLoading: (loading: boolean) => void
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  open: false,
  loading: false,
  options: null,
  request: (options) => set({ open: true, loading: false, options }),
  close: () => set({ open: false, loading: false, options: null }),
  setLoading: (loading) => set({ loading }),
}))

export function confirm(options: ConfirmOptions) {
  useConfirmStore.getState().request(options)
}
