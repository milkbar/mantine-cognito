import { useDarkMode } from 'storybook-dark-mode';
import { MantineProvider, ColorSchemeProvider } from '@mantine/core';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

function ThemeWrapper(props: { children: React.ReactNode }) {
  const colorScheme = useDarkMode() ? 'dark' : 'light';

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => {}}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        {props.children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export const decorators = [(renderStory: Function) => <ThemeWrapper>{renderStory()}</ThemeWrapper>];
