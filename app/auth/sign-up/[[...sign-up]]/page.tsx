import { SignUp } from "@clerk/nextjs"
import { CenteredLayout } from "@/components/layouts"

export default function SignUpPage() {
  return (
    <CenteredLayout>
      <SignUp />
    </CenteredLayout>
  )
}
