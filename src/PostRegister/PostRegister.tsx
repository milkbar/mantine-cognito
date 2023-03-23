import { Anchor, Paper, Title, Text, Container } from '@mantine/core';
import type { LoginStage } from '../Login';

export interface PostRegisterProps {
  email?: string;
  setStage?: (stage: LoginStage) => void;
}
export const PostRegister = ({ email, setStage }: PostRegisterProps) => {
  return (
    <Container size={420} my={40}>
      <Title align="center">
        <Text>Registered!</Text>
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        <Text span> Thank you for registering! </Text>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Text size="sm">
          A validation email has been sent{email !== undefined && ` to ${email}`}.
        </Text>
        <Text span size="sm">
          Once you have validated
        </Text>{' '}
        <Anchor
          span
          size="sm"
          component="button"
          onClick={() => {
            setStage?.('login');
          }}
        >
          login
        </Anchor>{' '}
        <Text span size="sm">
          again.
        </Text>
      </Paper>
    </Container>
  );
};
