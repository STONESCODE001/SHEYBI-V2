"use client"

import * as React from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type CardImageState = "default" | "loading" | "error"

interface CardImageProps extends React.ComponentProps<"div"> {
  /** Image source URL. */
  readonly src?: string
  /** Required alt text for the image. */
  readonly alt: string
}

/**
 * Internal image renderer. Uses the `src` as React key so that
 * when `src` changes, React remounts this component and the
 * loading state resets naturally — no synchronous setState in an effect.
 */
function CardImageInner({
  src,
  alt,
  className,
  ...props
}: {
  src?: string
  alt: string
  className?: string
} & React.ComponentProps<"div">): React.ReactElement {
  const [imageState, setImageState] = React.useState<CardImageState>(
    src ? "loading" : "error"
  )

  function handleLoad(): void {
    setImageState("default")
  }

  function handleError(): void {
    setImageState("error")
  }

  return (
    <div
      data-slot="card-image"
      data-state={imageState}
      role="img"
      aria-label={alt}
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        "bg-[var(--bg-surface-secondary)]",
        "aspect-video",
        className
      )}
      {...props}
    >
      {imageState === "loading" && (
        <Skeleton className="absolute inset-0 size-full rounded-xl" />
      )}

      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "object-cover",
            "transition-opacity duration-200",
            imageState === "loading" && "opacity-0",
            imageState === "default" && "opacity-100",
            imageState === "error" && "hidden"
          )}
        />
      )}

      {imageState === "error" && (
        <Image
          src="/testimg.png"
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      )}
    </div>
  )
}

function CardImage({
  src,
  alt,
  className,
  ...props
}: CardImageProps): React.ReactElement {
  return (
    <CardImageInner
      key={src ?? "__no_src__"}
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  )
}

export { CardImage }
export type { CardImageProps, CardImageState }