/*********************************************************************************\
* Copyright (c) 2024 Flammrock                                                    *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/

import React, { useEffect, useState } from 'react'
import CodeEditor from './components/CodeEditor'
import Batch from './languages/batch'
import { Nova } from './languages/nova'
import Generator from './languages/nova/generator'

const extractMessageError = (error: any): string => {
  const uncaught = 'uncaught error (see console for details)'
  if (error === null) return uncaught
  if (typeof error === 'string') return error
  if (typeof error === 'object') {
    if (typeof error.message === 'string') return error.message
    if (typeof error.toString === 'function') return error.toString()
  }
  return uncaught
}

function App() {
  const generator = new Generator()

  const defaultNovaCode =
    '; Lines starting with ";" are comments\n\nmax(a, b) = a > b ? a : b\nmin(a, b) = a < b ? a : b\n\nfoo(bar) = max(0, min(100, bar)) ; example'
  const [batchCode, setBatchCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onCodeChangeHandle = (code: string): void => {
    try {
      setBatchCode(generator.generate(code))
      setError(null)
    } catch (e) {
      console.error(e)
      setError(extractMessageError(e))
    }
  }

  useEffect(() => {
    onCodeChangeHandle(defaultNovaCode)
  }, [])

  return (
    <div className="App">
      <div className="bg-white dark:bg-gray-900 mb-4">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
            Batch Branchless Playground
          </h1>
          <div className="mb-4 text-lg font-normal text-gray-500 sm:px-16 xl:px-48 dark:text-gray-400">
            Convert
            <svg className="m-2 inline-block w-6 h-6" viewBox="0 0 630 630" xmlns="http://www.w3.org/2000/svg">
              <rect width="630" height="630" fill="#f7df1e" />
              <path d="m423.2 492.19c12.69 20.72 29.2 35.95 58.4 35.95 24.53 0 40.2-12.26 40.2-29.2 0-20.3-16.1-27.49-43.1-39.3l-14.8-6.35c-42.72-18.2-71.1-41-71.1-89.2 0-44.4 33.83-78.2 86.7-78.2 37.64 0 64.7 13.1 84.2 47.4l-46.1 29.6c-10.15-18.2-21.1-25.37-38.1-25.37-17.34 0-28.33 11-28.33 25.37 0 17.76 11 24.95 36.4 35.95l14.8 6.34c50.3 21.57 78.7 43.56 78.7 93 0 53.3-41.87 82.5-98.1 82.5-54.98 0-90.5-26.2-107.88-60.54zm-209.13 5.13c9.3 16.5 17.76 30.45 38.1 30.45 19.45 0 31.72-7.61 31.72-37.2v-201.3h59.2v202.1c0 61.3-35.94 89.2-88.4 89.2-47.4 0-74.85-24.53-88.81-54.075z" />
            </svg>
            Expression Like into Branchless Batch equivalent
          </div>
          <div className="flex flex-col mb-1 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href="https://github.com/Flammrock/branchless-batch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 -ml-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Source code
            </a>
            <a
              href="https://batch.xoo.it/t6652-Operations-Branchless.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              Learn more
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div style={{ height: '70vh' }} className="container mx-auto md:px-20 mb-16">
        <div className="h-full flex flex-wrap lg:-m-4">
          <div className="h-full flex flex-col flex-grow lg:flex-shrink-0 lg:basis-0 w-full lg:w-1/2 lg:m-4 border border-gray-300 rounded shadow-lg">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Nova</div>
              <p className="text-gray-700 text-base">
                Nova is a minimalist programming language designed for concise expression definitions, utilizing the
                same operator precedence as JavaScript for familiarity and ease of use. Input your Nova code here. It
                will be automatically transpiled to a branchless batch equivalent.
              </p>
            </div>
            <div className="relative flex-grow overflow-y-auto p-2">
              <CodeEditor
                className="h-full"
                defaultCode={defaultNovaCode}
                onCodeChange={onCodeChangeHandle}
                extensions={[Nova()]}
              />
              {error !== null ? (
                <div className="w-full px-4 pb-4 absolute left-0 bottom-0">
                  <div className="w-full p-2 rounded bg-red-600">Error: {error}</div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="h-full flex flex-col flex-grow lg:flex-shrink-0 lg:basis-0 w-full lg:w-1/2 lg:m-4 border border-gray-300 rounded shadow-lg">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Branchless Batch</div>
              <p className="text-gray-700 text-base">
                Branchless batch refers to optimized code execution without traditional branching logic, enhancing
                performance by minimizing conditional statements.
              </p>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
              <CodeEditor className="h-full" code={batchCode} extensions={[Batch()]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
