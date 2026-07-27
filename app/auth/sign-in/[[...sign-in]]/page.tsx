import { SignIn } from "@clerk/nextjs"
import { CenteredLayout } from "@/components/layouts"

export default function SignInPage() {
  return (
    <CenteredLayout>
      <SignIn />
    </CenteredLayout>
  )
}
