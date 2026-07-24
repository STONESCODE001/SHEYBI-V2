import type { ReactNode } from "react"

interface DialogLayerProps {
  readonly children?: ReactNode
  readonly className?: string
}

/**
 * Z-index host for modal dialogs (owned content from 07-dialog.md).
 * Renders structural host always; children appear when provided.
 */
function DialogLayer({ children }: DialogLayerProps) {
  if (!children) {
    return <div data-slot="dialog-layer" className="contents" aria-hidden="true" />
  }

  return (
    <div data-slot="dialog-layer" className="contents">
      {children}
    </div>
  )
}

export { DialogLayer }
export type { DialogLayerProps }
