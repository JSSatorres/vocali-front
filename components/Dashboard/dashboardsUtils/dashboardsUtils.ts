export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "green"
    case "processing":
    case "pending":
      return "amber"
    case "failed":
      return "red"
    default:
      return "gray"
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return "Today"
  } else if (days === 1) {
    return "Yesterday"
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

export const parseDuration = (duration: string): number => {
  const parts = duration.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1] // mm:ss
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2] // hh:mm:ss
  }
  return 0
}
