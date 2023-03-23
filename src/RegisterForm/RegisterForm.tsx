import { TextInput, Anchor, Paper, Title, Text, Container, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

import { signUp } from '../cognito';

import { PasswordCreateInput } from '../PasswordCreateInput';
import { useCognito } from '../CognitoProvider';
import type { LoginLifecycle } from '../Login';

export interface RegisterFormProps {
  email?: string;
  setEmail?: (email: string) => void;
  setStage?: (stage: LoginLifecycle) => void;
}

export const RegisterForm = ({ email, setEmail, setStage }: RegisterFormProps) => {
  const { config } = useCognito();

  const form = useForm({
    initialValues: { email: email === undefined ? '' : email, password: '' },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const onSubmit = () => {
    setEmail?.(form.values.email);
    signUp(config, form.values.email, form.values.password)
      .then(() => {
        setStage?.('post-register');
      })
      .catch((reason: Error) => {
        switch (reason.name) {
          case 'UsernameExistsException': {
            form.setFieldError('email', reason.message);
            break;
          }
          case 'InvalidPasswordException': {
            form.setFieldError('password', reason.message);
            break;
          }
          default: {
            console.error(reason.name, reason.message);
            alert(reason.message);
          }
        }
      });
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">
        <Text>Register</Text>
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        <Text span> Already have an account?</Text>{' '}
        <Anchor
          size="sm"
          component="button"
          onClick={() => {
            setStage?.('login');
          }}
        >
          <Text span>Login.</Text>
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@email.com"
            required
            {...form.getInputProps('email')}
          />

          <PasswordCreateInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
            required
            mt="md"
          />

          <Button type="submit" fullWidth mt="xl">
            <Text>Register</Text>
          </Button>
        </form>
      </Paper>
    </Container>
  );
};
