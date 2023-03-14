import { Box, Progress, PasswordInput, Group, Text, Center, type PasswordInputProps } from "@mantine/core"
import { useInputState } from "@mantine/hooks"
import { IconCheck, IconX } from "@tabler/icons-react"

export type PasswordCreateInputProps = PasswordInputProps

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
    return (
        <Text color={meets ? "teal" : "red"} mt={5} size="sm">
            <Center inline>
                {meets ? <IconCheck size={12} stroke={1.5} /> : <IconX size={12} stroke={1.5} />}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    )
}

const requirements = [
    { re: /[0-9]/, label: "Includes number" },
    { re: /[a-z]/, label: "Includes lowercase letter" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
]

const getStrength = (password: PasswordCreateInputProps["value"]) => {
    if (password === undefined) return 0

    const value = password.toString()
    let multiplier = value.length > 5 ? 0 : 1

    requirements.forEach((requirement) => {
        if (!requirement.re.test(value)) {
            multiplier += 1
        }
    })

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0)
}

export const PasswordCreateInput = (props: PasswordCreateInputProps) => {
    const [value, setValue] = useInputState(props.value)
    const strength = getStrength(value)
    const valueString = value === undefined ? "" : value.toString()

    const onChange: PasswordCreateInputProps["onChange"] = (event) => {
        setValue(event.currentTarget.value)
        props.onChange?.(event)
    }

    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(valueString)} />
    ))

    const bars = Array(4)
        .fill(0)
        .map((_, index) => {
            return (
                <Progress
                    styles={{ bar: { transitionDuration: "0ms" } }}
                    value={valueString.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0}
                    color={strength > 80 ? "teal" : strength > 50 ? "yellow" : "red"}
                    key={index}
                    size={4}
                />
            )
        })

    return (
        <div>
            <PasswordInput {...props} onChange={onChange} />

            <Group spacing={5} grow mt="xs" mb="md">
                {bars}
            </Group>

            <PasswordRequirement label="Has at least 8 characters" meets={valueString.length > 7} />
            {checks}
        </div>
    )
}
