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

// https://github.com/codemirror/dev/issues/1263

import { Input, Parser as BaseParser, PartialParse, Tree, TreeFragment, NodeType as NodeType } from '@lezer/common'
import { Tag, styleTags } from '@lezer/highlight'
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
  HighlightStyle,
  syntaxHighlighting
} from '@codemirror/language'
import { Extension } from '@codemirror/state'
import Parser from './parser'
import AST, { NodeTypeId, NodeTypeName, NodeType as RawNodeType } from './ast'

class NovaParser extends BaseParser {
  createParse(
    input: Input,
    _fragments: readonly TreeFragment[],
    ranges: readonly { from: number; to: number }[]
  ): PartialParse {
    const source = input.read(0, input.length)
    const parser = new Parser(source)
    const program = parser.parse({ ignoreErrors: true })
    return {
      advance(): Tree | null {
        return ToCodeMirrorTree(program)
      },
      parsedPos: input.length,
      stopAt(pos: number): void {
        console.log('✎: [line 39][parser.ts] pos: ', pos)
      },
      stoppedAt: input.length
    }
  }
}

export const NovaTags = (Object.keys(NodeTypeId) as Array<NodeTypeName>).reduce(
  (acc, cur) => {
    acc[cur] = Tag.define()
    return acc
  },
  {} as Record<NodeTypeName, Tag>
)

const styles = styleTags(NovaTags)
export function ToCodeMirrorTree(node: RawNodeType): Tree {
  const children = (AST.children(node) ?? []).sort((a, b) => {
    return (a.metadata?.start ?? 0) - (b.metadata?.start ?? 0)
  })
  return new Tree(
    NodeType.define({
      id: NodeTypeId[node.type],
      name: node.type,
      top: node.type === 'Program',
      props: [styles]
    }),
    children.map(ToCodeMirrorTree),
    children.map((child) => (child.metadata?.start ?? 0) - (node.metadata?.start ?? 0)),
    node.metadata?.length ?? 0,
    []
  )
}

const highlightStyle = HighlightStyle.define([
  {
    tag: NovaTags.NumberLiteral,
    color: '#C800E4'
  },
  {
    tag: NovaTags.Operator,
    color: '#CB1F00'
  },
  {
    tag: NovaTags.IdentifierLiteral,
    color: '#2F31BA'
  },
  {
    tag: NovaTags.FunctionDefinition,
    fontStyle: 'italic'
  },
  {
    tag: NovaTags.VariableDefinition,
    fontStyle: 'italic'
  },
  {
    tag: NovaTags.FunctionParameter,
    color: '#009905'
  },
  {
    tag: NovaTags.ArgumentIdentifier,
    color: '#009905',
    fontWeight: 'bold'
  },
  {
    tag: NovaTags.Comment,
    color: '#898989',
    fontStyle: 'italic'
  },
  {
    tag: NovaTags.CommentStatement,
    color: '#898989',
    fontStyle: 'italic'
  }
])

const facet = defineLanguageFacet()
const parser = new NovaParser()
const novaLanguage = new Language(facet, parser, [], 'nova')

export function Nova(): Array<Extension> {
  return [new LanguageSupport(novaLanguage), syntaxHighlighting(highlightStyle)]
}
