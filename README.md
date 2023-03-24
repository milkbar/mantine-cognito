# Mantine Cognito

[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Stars][stars-image]][stars-url]
[![Last commit][last-commit-image]][repo-url]
[![Closed issues][closed-issues-image]][closed-issues-url]
[![Downloads][downloads-image]][npm-url]
[![Language][language-image]][repo-url]

This project provides a Mantine based front end for an AWS Cognito login.

<img src="https://user-images.githubusercontent.com/319506/225537205-b4d9e03b-b5fb-4b12-a17a-ae3f4fe66b7b.png" alt="image" width="300"/>

The code is working, but the project is super early in its lifespan and
is still coming together. Documentation is in the works.

## Quickstart

Install the package and its dependencies:

```sh
yarn add @mantine/core @mantine/hooks @emotion/react @mantine/form @mantine/notifications @tabler/icons-react mantine-cognito
```

To use it in your code, first wrap your app with a new provider above any
components that need access to authentication information:

```tsx
import { CognitoProvider } from 'mantine-cognito';

root.render(
  <React.StrictMode>
    <CognitoProvider cognitoClientID={clientID} cognitoUserPoolID={userPoolID} cognitoIdentityPoolID={identityPoolID}>
      <App />
    </CognitoProvider>
  </React.StrictMode>
);
```

The Client ID and User Pool ID are required and are the IDs of the AWS
Cognito User Pool controlling access and the configured UI Client for the
User Pool.

The Identity Pool ID is optional and is used if you want the users in the
User Pool to access other AWS services using their authentication.

Once you have the provider installed, you can add in the Login component:

```tsx
import { Login, LoginStage } from 'mantine-cognito';

export interface LoginPageProps {
  stage?: LoginStage;
}

export const LoginPage = ({ stage = 'login' }: LoginPageProps) => {
  return (
    <Login
      stage={stage}
      onLogin={(attributes) => {
        console.log(`User logged in ${attributes.email}`);
      }}
    />
  );
};
```

The Login component provides all the user interface needed for an
unauthenticated user. It manages logging in (including support for MFA via an
authenticator application), registering a new user, resetting passwords, and handling forgotten passwords.

If you want to provide direct access to any of those flows via their own URL
it is possible to have the component start out in any of those states. For
example using react router:

```tsx
<Route path="/auth">
  <Route path="login" element={<LoginPage />} />
  <Route path="forgot" element={<LoginPage stage="forgot" />} />
  <Route path="reset" element={<LoginPage stage="reset" />} />
  <Route path="register" element={<LoginPage stage="register" />} />
</Route>
```

For the portions of your application that you want to be accessible only to authenticated user, you can (using react router):

```tsx
import { ProtectedRoute } from "mantine-cognito"

<Route
  path="/app"
  element={
    <ProtectedRoute
      unauthenticated={<Navigate to="/" />}
      onValidate={(attributes) => {
        console.log(`User reverified: ${attributes.email}`)
      }}
    >
      <Contents />
    </ProtectedRoute>
  }
>
```

There is also a component available for users to enable / disable MFA on their accounts:

```tsx
import { MFASetup } from 'mantine-cognito';

export const Settings = () => {
  return <MFASetup mfaAppName="My Example Application" />;
};
```

You also have access to some methods via a hook that is available anywhere
under the `CognitoProvider`:

```tsx
import { useCognito } from 'mantine-cognito';

export const SignoutButton = () => {
  const { logout } = useCognito();

  return <Button onClick={() => logout()}>Log Out</Button>;
};
```

Or for example, if you have an identity pool setup and need a signed AWS url
to provide access to a protect AWS resource:

```tsx
import { useCognito } from "mantine-cognito"

export interface WebsocketProviderProps {
    url: string
    children?: React.ReactNode
}

export const WebsocketProvider = ({ url, children }: WebsocketProviderProps) => {
    const { presign } = useCognito()

    useEffect(() => {
      presign(url, "execute-api")
        .then((presigned) => {
          const socket = new WebSocket(presigned)
          ...
        }
    }, [presign, url])

    ...
}
```

## Terraform

There is an example terraform module for creating a compatible cognito environment in the [infrastructure](infrastructure) directory of the repo.

## Code contributors

[![Contributors list](https://contrib.rocks/image?repo=milkbar/mantine-cognito)](https://github.com/milkbar/mantine-cognito/graphs/contributors)

## License

The [MIT License](https://github.com/milkbar/mantine-cognito/blob/master/LICENSE).

[npm-url]: https://npmjs.org/package/@milkbar/mantine-cognito
[repo-url]: https://github.com/milkbar/mantine-cognito
[stars-url]: https://github.com/milkbar/mantine-cognito/stargazers
[closed-issues-url]: https://github.com/milkbar/mantine-cognito/issues?q=is%3Aissue+is%3Aclosed
[license-url]: LICENSE
[npm-image]: https://img.shields.io/npm/v/@milkbar/mantine-cognito.svg?style=flat-square
[license-image]: http://img.shields.io/npm/l/@milkbar/mantine-cognito.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/@milkbar/mantine-cognito.svg?style=flat-square
[stars-image]: https://img.shields.io/github/stars/milkbar/mantine-cognito?style=flat-square
[last-commit-image]: https://img.shields.io/github/last-commit/milkbar/mantine-cognito?style=flat-square
[closed-issues-image]: https://img.shields.io/github/issues-closed-raw/milkbar/mantine-cognito?style=flat-square
[language-image]: https://img.shields.io/github/languages/top/milkbar/mantine-cognito?style=flat-square
