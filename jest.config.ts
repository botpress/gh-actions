import type { Config } from '@jest/types'
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  preset: 'ts-jest',

  projects: [
    {
      testMatch: ['<rootDir>/get_release_details/test/(*.)test.ts'],
      displayName: { name: 'GetReleaseDetails', color: 'blue' },
      testEnvironment: 'jsdom',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    }
  ]
}

export default config
