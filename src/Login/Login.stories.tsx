import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Login as LoginComponent } from '.';

export default {
  title: 'Login',
  component: LoginComponent,
  // argTypes: { stage: { control: 'inline-radio' } },
} as ComponentMeta<typeof LoginComponent>;

const Template: ComponentStory<typeof LoginComponent> = (args) => <LoginComponent {...args} />;

export const Login = Template.bind({});
Login.args = {};
