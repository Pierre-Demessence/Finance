import { StorybookConfig } from '@storybook/nextjs';


const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-themes",
    "@storybook/addon-measure",
    "@chromatic-com/storybook",
    "@storybook/addon-styling-webpack",
    "@storybook/experimental-addon-test",
    "storybook-dark-mode",
    "@storybook/addon-storysource"

  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "..\\public"
  ]
};
export default config;