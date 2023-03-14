import { useState, useEffect } from "react"
import { Stack, Title, Button, Text, PinInput, Anchor, Group, rem, TextInput } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"
import { QRCodeSVG } from "qrcode.react"
import UAParser from "ua-parser-js"

import { associateSoftwareToken, enableMFA, verifySoftwareToken, getUserData, disableMFA } from "../cognito"
import { useCognito } from "../CognitoProvider"

export interface MFASetupProps {
    mfaAppName: string
}

export const MFASetup = ({ mfaAppName }: MFASetupProps) => {
    const { config } = useCognito()

    const clipboard = useClipboard()
    const [mode, setMode] = useState<"disabled" | "enabling" | "enabled">("disabled")
    const [code, setCode] = useState<string>()
    const [email, setEmail] = useState<string>()

    const uap = new UAParser(navigator.userAgent)
    const name = `${uap.getResult().os.name} ${uap.getBrowser().name}`
    const form = useForm({
        initialValues: {
            deviceName: name,
            pin: "",
        },
    })

    useEffect(() => {
        getUserData(config).then((data) => {
            if (!data) return console.error("No user data in MFASetup.")
            if (data.PreferredMfaSetting === "SOFTWARE_TOKEN_MFA") setMode("enabled")
            setEmail(data.UserAttributes.find((attr) => attr.Name === "email")?.Value)
        })
    }, [])

    useEffect(() => {
        // forms use React state to store values so we need to wait for a refresh
        // after setting value before processing
        if (mode === "enabling" && form.values.pin.length === 6 && !form.errors.pin) {
            // No errors and full length, try the code
            verifySoftwareToken(config, form.values.pin, form.values.deviceName)
                .then(() => {
                    enableMFA(config)
                        .then(() => {
                            setMode("enabled")
                        })
                        .catch((err) => {
                            console.error(err)
                        })
                })
                .catch((err: Error) => {
                    form.setFieldError("pin", err.message)
                    console.error(err.name, err.message)
                })
        }
    }, [mode, form])

    const onStartEnable = () => {
        form.setFieldValue("pin", "")
        associateSoftwareToken(config).then((code) => {
            setCode(code)
            setMode("enabling")
        })
    }

    const onDisable = () => {
        disableMFA(config)
            .then(() => {
                setMode("disabled")
            })
            .catch((err) => {
                console.error(err.name, err.message)
            })
    }

    const value = `otpauth://totp/${mfaAppName}${email && `:${email}`}?secret=${code}`
    const enabling = code ? (
        <form>
            <Stack spacing="lg">
                <Group spacing={rem(5)}>
                    <Text size="sm" span>
                        Scan the qr code or{" "}
                    </Text>
                    <Anchor
                        span
                        size="sm"
                        onClick={() => {
                            clipboard.copy(code)
                            notifications.show({
                                title: "Copied",
                                autoClose: 1000,
                                message: "Secret code copied to clipboard.",
                            })
                        }}
                    >
                        click here
                    </Anchor>
                    <Text size="sm" span>
                        to copy the secret code.
                    </Text>
                </Group>

                <QRCodeSVG value={value} />
                <Text size="sm">Then enter the code from your authenticator app.</Text>
                <TextInput label="Device Name" {...form.getInputProps("deviceName")} />
                <Stack spacing={5}>
                    <Text size="xs">Code</Text>
                    <PinInput autoFocus type="number" size="xl" length={6} required {...form.getInputProps("pin")} />
                    <Text size="xs" color="red">
                        {form.errors.pin}
                    </Text>
                </Stack>
            </Stack>
        </form>
    ) : (
        <Text size="sm" color="red">
            No code received.
        </Text>
    )

    return (
        <Stack>
            <Title order={3}>Two Factor Authentication</Title>
            {mode === "disabled" && <Button onClick={onStartEnable}>Enable 2FA</Button>}
            {mode === "enabling" && enabling}
            {mode === "enabled" && (
                <Button color="red" onClick={onDisable}>
                    Disable 2FA
                </Button>
            )}
        </Stack>
    )
}
