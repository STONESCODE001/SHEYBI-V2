"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type CountdownTimerSize = "sm" | "lg"
type CountdownTimerState = "running" | "paused" | "completed"

interface CountdownTimerProps extends React.ComponentProps<"time"> {
  /** Target date/time to count down to. */
  readonly targetDate: Date
  /** Visual size variant. */
  readonly size?: CountdownTimerSize
  /** Callback fired when the countdown reaches zero. */
  readonly onComplete?: () => void
}

/** Format a number with leading zero. */
function padUnit(value: number): string {
  return String(value).padStart(2, "0")
}

/** Calculate remaining time from now to target. */
function calculateRemaining(target: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const total = Math.max(0, target.getTime() - Date.now())
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / 1000 / 60 / 60) % 24)
  const days = Math.floor(total / 1000 / 60 / 60 / 24)
  return { days, hours, minutes, seconds, total }
}

function CountdownTimer({
  targetDate,
  size = "sm",
  onComplete,
  className,
  ...props
}: CountdownTimerProps): React.ReactElement {
  const [remaining, setRemaining] = React.useState(() =>
    calculateRemaining(targetDate)
  )
  const completedRef = React.useRef(false)
  const [prevTargetTime, setPrevTargetTime] = React.useState(targetDate.getTime())

  let currentRemaining = remaining
  if (targetDate.getTime() !== prevTargetTime) {
    setPrevTargetTime(targetDate.getTime())
    currentRemaining = calculateRemaining(targetDate)
    setRemaining(currentRemaining)
  }

  const timerState: CountdownTimerState =
    currentRemaining.total <= 0 ? "completed" : "running"

  React.useEffect(() => {
    completedRef.current = false
  }, [targetDate])

  React.useEffect(() => {
    if (timerState === "completed") {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete?.()
      }
      return
    }

    const interval = setInterval(() => {
      setRemaining(calculateRemaining(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, timerState, onComplete])

  const formattedTime =
    currentRemaining.days > 0
      ? `${currentRemaining.days}d ${padUnit(currentRemaining.hours)}:${padUnit(currentRemaining.minutes)}:${padUnit(currentRemaining.seconds)}`
      : `${padUnit(currentRemaining.hours)}:${padUnit(currentRemaining.minutes)}:${padUnit(currentRemaining.seconds)}`

  return (
    <time
      data-slot="countdown-timer"
      data-state={timerState}
      role="timer"
      aria-live={timerState === "completed" ? "polite" : undefined}
      dateTime={targetDate.toISOString()}
      className={cn(
        "inline-flex items-center font-mono tabular-nums",
        "transition-colors duration-200",
        size === "sm" && "text-sm",
        size === "lg" && "text-xl font-semibold",
        timerState === "completed"
          ? "text-[var(--text-muted)]"
          : "text-[var(--text-primary)]",
        className
      )}
      {...props}
    >
      {timerState === "completed" ? "00:00:00" : formattedTime}
    </time>
  )
}

export { CountdownTimer }
export type { CountdownTimerProps, CountdownTimerSize, CountdownTimerState }
