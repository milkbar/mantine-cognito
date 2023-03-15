import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Login as LoginComponent } from "mantine-cognito"

export default {
    title: "Login",
    component: LoginComponent,
} as ComponentMeta<typeof LoginComponent>

const Template: ComponentStory<typeof LoginComponent> = (args) => <LoginComponent {...args} />

export const Login = Template.bind({})
Login.args = {}
