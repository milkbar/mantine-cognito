import { Paper, Title, Text, Container, Button, TextInput, Anchor } from "@mantine/core"
import { useForm } from "@mantine/form"

import { confirmPassword } from "../cognito"
import { LoginStage } from "../Login"
import { useCognito } from "../CognitoProvider"
import { PasswordCreateInput } from "../PasswordCreateInput"

export interface PostForgotPasswordFormProps {
    email?: string
    setStage?: (stage: LoginStage) => void
}
export const PostForgotPasswordForm = ({ email, setStage }: PostForgotPasswordFormProps) => {
    const { config } = useCognito()

    const form = useForm({
        initialValues: { code: "", password: "" },
    })

    const onSubmit = () => {
        if (!email) {
            form.setFieldError("code", "Email failed to be passed from the reset password page.")
            return
        }

        confirmPassword(config, email, form.values.code, form.values.password)
            .then(() => {
                setStage != null && setStage("reset")
            })
            .catch((reason: Error) => {
                switch (reason.name) {
                    case "CodeMismatchException": {
                        form.setFieldError("code", reason.message)
                        break
                    }
                    default: {
                        console.error(reason.name, reason.message)
                        alert(reason.message)
                    }
                }
            })
    }

    return (
        <Container size={420} my={40}>
            <Title align="center">
                <Text>Reset Password</Text>
            </Title>

            <Text color="dimmed" size="sm" align="center" mt={5}>
                <Text span size="sm">
                    Enter the code sent to {email} to reset your password or{" "}
                </Text>
                <Anchor
                    span
                    onClick={() => {
                        setStage != null && setStage("forgot")
                    }}
                >
                    request
                </Anchor>
                <Text span size="sm">
                    {" "}
                    a new confirmation code.
                </Text>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(onSubmit)}>
                    <TextInput label="Code" placeholder="12345" required {...form.getInputProps("code")} />
                    <PasswordCreateInput
                        label="New Password"
                        placeholder="New password"
                        required
                        {...form.getInputProps("password")}
                        mt="md"
                    />
                    <Button type="submit" fullWidth mt="xl">
                        <Text>Reset Password</Text>
                    </Button>
                </form>
            </Paper>
        </Container>
    )
}
