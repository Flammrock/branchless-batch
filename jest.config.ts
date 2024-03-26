import type { Config } from '@jest/types'
import path from 'path'

const coveragePath = path.resolve(__dirname, 'coverage')

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: coveragePath
}

export default config
