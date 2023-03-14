import { Paper, Title, Text, Container, Anchor } from "@mantine/core"
import { LoginStage } from "../Login"

export interface PasswordResetFormProps {
    email?: string
    setStage?: (stage: LoginStage) => void
}

export const PasswordResetForm = ({ email, setStage }: PasswordResetFormProps) => {
    return (
        <Container size={420} my={40}>
            <Title align="center">
                <Text>Password Reset</Text>
            </Title>

            <Text color="dimmed" size="sm" align="center" mt={5}>
                <Text span>The password{email && ` for ${email}`} has been reset.</Text>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Text span size="sm">
                    Your password has been successfully reset, return to{" "}
                </Text>
                <Anchor
                    span
                    size="sm"
                    onClick={() => {
                        setStage != null && setStage("login")
                    }}
                >
                    login
                </Anchor>{" "}
                <Text span size="sm">
                    to continue.
                </Text>
            </Paper>
        </Container>
    )
}
