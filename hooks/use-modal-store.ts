"use client"

import { create } from "zustand"

export type ModalType = "enhancedNewLoad" | "assignDriver" | "notifyDriver" | "loadDetails" | "aiCommunication"

interface ModalData {
  [key: string]: any
}

interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => {
    console.log("🎭 Modal opening:", type, data)
    set({ isOpen: true, type, data })
  },
  onClose: () => set({ isOpen: false, type: null }),
}))
