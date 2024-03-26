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

import { parser } from './parser'
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
  HighlightStyle,
  syntaxHighlighting
} from '@codemirror/language'
import { Extension } from '@codemirror/state'
import { styleTags, tags as t } from '@lezer/highlight'
import styles from './highlight.module.css'

export const EXAMPLELanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: ')', align: false })
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Boolean: t.bool,
        String: t.string,
        'LineComment rem CommentText': t.lineComment,
        Number: t.number,
        Variable: t.variableName,
        'if else goto for in do call exit not exist errorlevel defined cscript prn nul lpt3 lpt2 lpt1 con com4 com3 com2 com1 aux shift cd dir echo setlocal endlocal set copy append assoc at attrib break cacls cd chcp chdir chkdsk chkntfs cls cmd color comp compact convert date diskcomp diskcopy doskey erase fs find findstr format ftype graftabl help keyb md mkdir mode more move path pause print popd pushd promt prompt rd recover rename replace restore rmdir shiftsort start subst time title tree type ver verify vol ping net ipconfig taskkill xcopy ren del':
          t.keyword,
        'And Equal Redirector': t.operator,
        Arobase: t.annotation,
        Label: t.labelName,
        '( )': t.paren
      })
    ]
  })
})

const keywordList = [
  'if',
  'else',
  'goto',
  'for',
  'in',
  'do',
  'call',
  'exit',
  'not',
  'exist',
  'errorlevel',
  'defined',
  'cscript',
  'prn',
  'nul',
  'lpt3',
  'lpt2',
  'lpt1',
  'con',
  'com4',
  'com3',
  'com2',
  'com1',
  'aux',
  'shift',
  'cd',
  'echo',
  'setlocal',
  'endlocal',
  'set',
  'copy',
  'append',
  'assoc',
  'at',
  'attrib',
  'break',
  'cacls',
  'chcp',
  'chdir',
  'chkdsk',
  'chkntfs',
  'cls',
  'cmd',
  'color',
  'comp',
  'compact',
  'convert',
  'date',
  'dir',
  'diskcomp',
  'diskcopy',
  'doskey',
  'erase',
  'fs',
  'find',
  'findstr',
  'format',
  'ftype',
  'graftabl',
  'help',
  'keyb',
  'md',
  'mkdir',
  'mode',
  'more',
  'move',
  'path',
  'pause',
  'print',
  'popd',
  'pushd',
  'promt',
  'prompt',
  'rd',
  'recover',
  'rem',
  'rename',
  'replace',
  'restore',
  'rmdir',
  'shiftsort',
  'start',
  'subst',
  'time',
  'title',
  'tree',
  'type',
  'ver',
  'verify',
  'vol',
  'ping',
  'net',
  'ipconfig',
  'taskkill',
  'xcopy',
  'ren',
  'del'
]

const keywordMap: Record<string, number> = {}
for (let i = 0; i < keywordList.length; i++) {
  keywordMap[keywordList[i].toLowerCase()] = i + 1
}

export const keywords = (name: string, stack: any) => {
  const found = typeof keywordMap[name.toLowerCase()] === 'undefined' ? null : keywordMap[name.toLowerCase()]
  return found == null ? -1 : found
}

const myHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#fc6' },
  { tag: t.variableName, color: '#E35D00', fontWeight: 'bold' },
  { tag: t.number, color: '#AC00DE', fontStyle: 'italic' },
  { tag: t.keyword, color: '#0014DE' },
  { tag: t.operator, color: '#FF0000' },
  { tag: t.annotation, color: '#AC00DE' },
  { tag: t.labelName, class: styles['batch-label'] },
  { tag: t.comment, color: '#299929' }
])

export default function Batch(): Array<Extension> {
  return [new LanguageSupport(EXAMPLELanguage), syntaxHighlighting(myHighlightStyle)]
}
