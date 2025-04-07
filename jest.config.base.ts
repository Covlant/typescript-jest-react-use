import type { Config } from '@jest/types';

export const baseJestConfig: Config.InitialOptions = {
  'preset': 'ts-jest',
  'clearMocks': true,
  'coverageDirectory': 'coverage',
  'testMatch': [
    '**/*.test.(ts|tsx)'
  ],
  'setupFiles': [
    './setupTests.ts'
  ]
}
