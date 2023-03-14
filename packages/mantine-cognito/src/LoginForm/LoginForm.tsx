import { useCallback, useEffect, useState } from "react"
import { useForm } from "@mantine/form"
import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
    PinInput,
    Stack,
} from "@mantine/core"

import { UserAttributes, getUserAttributes, login } from "../cognito"
import { LoginStage } from "../Login/Login"
import { useCognito } from "../CognitoProvider"

export interface LoginFormProps {
    email?: string
    onLogin?: (attributes: UserAttributes) => void
    setEmail?: (email: string) => void
    setStage?: (stage: LoginStage) => void
}

type LoginState = "password" | "totp"

export const LoginForm = ({ email, setStage, onLogin, setEmail }: LoginFormProps) => {
    const { config } = useCognito()
    const [mode, setMode] = useState<LoginState>("password")

    const form = useForm({
        initialValues: {
            email: email ?? "",
            password: "",
            pin: "",
            remember: false,
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
        },
    })

    const onSubmit = useCallback(() => {
        setEmail?.(form.values.email)
        login(
            config,
            form.values.email,
            form.values.password,
            form.values.remember,
            mode === "totp" ? form.values.pin : undefined,
        )
            .then(() => {
                getUserAttributes(config).then((attributes) => onLogin?.(attributes))
            })
            .catch((reason: Error) => {
                switch (reason.name) {
                    case "UserNotFoundException": {
                        form.setFieldError("email", reason.message)
                        break
                    }
                    case "NotAuthorizedException": {
                        form.setFieldError("password", "Incorrect password.")
                        break
                    }
                    case "LoginMFAException": {
                        form.setFieldValue("pin", "")
                        setMode("totp")
                        break
                    }
                    case "CodeMismatchException": {
                        form.setFieldError("pin", reason.message)
                        break
                    }
                    default: {
                        form.setFieldError("password", reason.message)
                        console.error(reason.name, reason.message)
                    }
                }
            })
    }, [mode, form])

    useEffect(() => {
        // Auto submit when pin is 6 characters long
        if (form.values.pin.length === 6 && form.errors.pin === undefined) {
            onSubmit()
        }
    }, [onSubmit, form])

    return (
        <Container size={420} my={40}>
            <Title align="center">
                <Text>Welcome biwblck!</Text>
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                <Text span>{"Don't have an account yet? "}</Text>
                <Anchor
                    size="sm"
                    component="button"
                    onClick={() => {
                        setStage?.("register")
                    }}
                >
                    <Text span>Create account.</Text>
                </Anchor>
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(onSubmit)}>
                    {mode === "password" && (
                        <>
                            <TextInput
                                label="Email"
                                placeholder="you@email.com"
                                required
                                {...form.getInputProps("email")}
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                {...form.getInputProps("password")}
                                required
                                mt="md"
                            />

                            <Group position="apart" mt="lg">
                                <Checkbox label="Remember me" {...form.getInputProps("remember")} />
                                <Anchor
                                    component="button"
                                    size="sm"
                                    onClick={() => {
                                        setStage?.("forgot")
                                    }}
                                >
                                    Forgot password?
                                </Anchor>
                            </Group>

                            <Button type="submit" fullWidth mt="xl">
                                <Text>Sign in</Text>
                            </Button>
                        </>
                    )}

                    {mode === "totp" && (
                        <Stack>
                            <Text size="sm">Login code from your authenticator app.</Text>
                            <Group spacing={4}>
                                <Text span color="dimmed" size="xs">
                                    Return to{" "}
                                </Text>
                                <Anchor
                                    span
                                    size="xs"
                                    onClick={() => {
                                        setMode("password")
                                    }}
                                >
                                    login.
                                </Anchor>
                            </Group>
                            <PinInput
                                type="number"
                                size="md"
                                length={6}
                                required
                                autoFocus={mode === "totp"}
                                onComplete={onSubmit}
                                {...form.getInputProps("pin")}
                            />
                            <Text color="red" size="xs">
                                {form.errors.pin}
                            </Text>
                        </Stack>
                    )}
                </form>
            </Paper>
        </Container>
    )
}
