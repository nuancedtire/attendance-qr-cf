import { useState, useEffect } from 'react'

const STAFF_ID_KEY = 'inout-staff-id'

export function useStaffIdentity(
  entries: { id: number; name: string; role: string | null }[],
) {
  const [staffId, setStaffId] = useState<number | null>(null)
  const [showIdentityPicker, setShowIdentityPicker] = useState(false)

  // On mount, load saved identity from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STAFF_ID_KEY)
    if (saved && entries.some((e) => String(e.id) === saved)) {
      setStaffId(Number(saved))
    }
  }, [entries])

  // Save identity to localStorage whenever staffId changes
  useEffect(() => {
    if (staffId !== null) {
      localStorage.setItem(STAFF_ID_KEY, String(staffId))
    } else {
      localStorage.removeItem(STAFF_ID_KEY)
    }
  }, [staffId])

  const selectIdentity = (id: number) => {
    setStaffId(id)
  }

  const clearIdentity = () => {
    setStaffId(null)
    localStorage.removeItem(STAFF_ID_KEY)
  }

  return {
    staffId,
    showIdentityPicker,
    selectIdentity,
    clearIdentity,
    setShowIdentityPicker,
  }
}
