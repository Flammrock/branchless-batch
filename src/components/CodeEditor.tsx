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

import React, { HTMLProps, createRef, useEffect, useState } from 'react'
import {
  lineNumbers,
  EditorView,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  ViewUpdate,
  ViewPlugin
} from '@codemirror/view'
import { EditorState, Extension } from '@codemirror/state'
import {
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap
} from '@codemirror/language'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

interface AdditionalProps {
  extensions?: Array<Extension>
  code?: string
  defaultCode?: string
  onCodeChange?: (code: string) => void
}

const Theme = EditorView.theme({
  '&': {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontWeight: 'normal',
    fontSize: '16px',
    fontFeatureSettings: '"liga" 0, "calt" 0',
    fontVariationSettings: 'normal',
    lineHeight: '19px',
    letterSpacing: '0px'
  },
  '.em': {
    color: 'green' // Customize comment color here
  },
  '.cm-variable': {
    color: 'blue' // Customize variable color here
  }
})

const ThemeExtension: Extension = [Theme]

export type CodeEditorProps = HTMLProps<HTMLDivElement> & AdditionalProps

const CodeEditor: React.FC<CodeEditorProps> = ({
  extensions,
  code,
  defaultCode,
  onCodeChange,
  ...props
}: CodeEditorProps) => {
  const container = createRef<HTMLDivElement>()
  const [editor, setEditor] = useState<EditorView | null>(null)

  useEffect(() => {
    if (container.current == null) return

    const viewExtensions: Array<Extension> = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
      ]),
      EditorView.lineWrapping,
      ThemeExtension
    ]

    if (typeof extensions !== 'undefined') {
      viewExtensions.push(...extensions)
    }

    if (typeof onCodeChange === 'function') {
      viewExtensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onCodeChange(update.state.doc.toString())
          }
        })
      )
    }

    const view = new EditorView({
      extensions: viewExtensions,
      parent: container.current,
      doc: defaultCode
    })

    view.dom.style.width = '100%'
    view.dom.style.height = '100%'

    setEditor(view)

    return () => {
      view.destroy()
      setEditor(null)
    }
  }, [])

  if (editor !== null && typeof code === 'string') {
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: code
      }
    })
  }

  return <div {...props} ref={container}></div>
}

export default CodeEditor
