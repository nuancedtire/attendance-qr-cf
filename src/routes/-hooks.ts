import { useState, useEffect } from 'react'

const STAFF_ID_KEY = 'inout-staff-id'
const STAFF_PIN_KEY = 'inout-staff-pin'

export function useStaffIdentity(
  entries: { id: number; name: string; role: string | null }[],
) {
  const [staffId, setStaffId] = useState<number | null>(null)
  const [staffPin, setStaffPin] = useState('')
  const [isLocked, setIsLocked] = useState(false) // locked = PIN set, must verify to change
  const [showPinEntry, setShowPinEntry] = useState(false)
  const [showIdentityPicker, setShowIdentityPicker] = useState(false)

  // On mount, load saved identity from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STAFF_ID_KEY)
    const savedPin = localStorage.getItem(STAFF_PIN_KEY)
    if (saved && entries.some((e) => String(e.id) === saved)) {
      setStaffId(Number(saved))
      if (savedPin) {
        setStaffPin(savedPin)
        setIsLocked(true)
      }
    }
  }, [entries])

  // Save identity to localStorage whenever staffId or locked state changes
  useEffect(() => {
    if (staffId !== null) {
      localStorage.setItem(STAFF_ID_KEY, String(staffId))
    } else {
      localStorage.removeItem(STAFF_ID_KEY)
      localStorage.removeItem(STAFF_PIN_KEY)
    }
  }, [staffId])

  // Save/clear PIN in localStorage when lock state changes
  useEffect(() => {
    if (isLocked && staffPin) {
      localStorage.setItem(STAFF_PIN_KEY, staffPin)
    } else if (!isLocked) {
      localStorage.removeItem(STAFF_PIN_KEY)
    }
  }, [isLocked, staffPin])

  const selectIdentity = (id: number) => {
    if (isLocked) {
      setShowPinEntry(true)
      return
    }
    setStaffId(id)
    setStaffPin('')
    setIsLocked(false)
  }

  const clearIdentity = () => {
    if (isLocked) {
      setShowPinEntry(true)
      return
    }
    setStaffId(null)
    setStaffPin('')
    setIsLocked(false)
    localStorage.removeItem(STAFF_ID_KEY)
    localStorage.removeItem(STAFF_PIN_KEY)
  }

  /**
   * Set a 4-digit PIN to lock the current identity.
   * Once locked, changing or clearing identity requires the PIN.
   */
  const lockIdentity = (pin: string) => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return false
    }
    setStaffPin(pin)
    setIsLocked(true)
    localStorage.setItem(STAFF_PIN_KEY, pin)
    return true
  }

  /**
   * Verify the PIN to unlock the identity for changes.
   * Returns true if the PIN matches, false otherwise.
   */
  const unlockIdentity = (pin: string): boolean => {
    if (pin === staffPin) {
      setIsLocked(false)
      setStaffPin('')
      localStorage.removeItem(STAFF_PIN_KEY)
      return true
    }
    return false
  }

  return {
    staffId,
    staffPin,
    isLocked,
    showPinEntry,
    showIdentityPicker,
    selectIdentity,
    clearIdentity,
    lockIdentity,
    unlockIdentity,
    setShowPinEntry,
    setShowIdentityPicker,
  }
}
