import { Paper, Title, Text, Container, Button, TextInput, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';

import { forgotPassword } from '../cognito';
import { useCognito } from '../CognitoProvider';
import type { LoginLifecycle } from '../Login';

export interface ForgotPasswordFormProps {
  email?: string;
  setEmail?: (email: string) => void;
  setStage?: (stage: LoginLifecycle) => void;
}

export const ForgotPasswordForm = ({ email, setEmail, setStage }: ForgotPasswordFormProps) => {
  const { config } = useCognito();

  const form = useForm({
    initialValues: { email: email ?? '' },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const onSubmit = () => {
    setEmail?.(form.values.email);
    forgotPassword(config, form.values.email)
      .then(() => {
        setStage?.('post-forgot');
      })
      .catch((reason: Error) => {
        switch (reason.name) {
          case 'UserNotFoundException': {
            form.setFieldError('email', 'Account not found for this email.');
            break;
          }
          default: {
            console.error(reason.name, reason.message);
            form.setFieldError('email', reason.message);
          }
        }
      });
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">
        <Text>Recover password</Text>
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        <Text span>Kick off a password recovery or return to the </Text>
        <Anchor
          onClick={() => {
            setStage?.('login');
          }}
        >
          login.
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput label="Email" placeholder="you@email.com" required {...form.getInputProps('email')} />

          <Button type="submit" fullWidth mt="xl">
            <Text>Recover Password</Text>
          </Button>
        </form>
      </Paper>
    </Container>
  );
};
