import "../src/app/globals.css"
import React from "react"
import type { Preview } from '@storybook/nextjs-vite'
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        "div",
        { className: `${GeistSans.variable} ${GeistMono.variable} font-sans` },
        React.createElement(Story)
      ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
