/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../draftExt.d.ts" />

import { Editor, EditorState, Entity, CharacterMetadata } from 'draft-js';
import { ITextProvider } from '../interface';
import { List, OrderedSet, is } from 'immutable';
import { objectAssign } from 'object-assign';
import { BlockMap } from 'draft-js';

import { EditorCore } from '../EditorCore/editor';

export type Style = OrderedSet<string>;
export const EMPTY_SET: Style = OrderedSet<string>();
export const DEFAULT_ELEMENT: string = 'span';
export const DEFAULT_INLINE_STYLE: Immutable.Map<any, any> = null;

const VENDOR_PREFIX: RegExp = /^(moz|ms|o|webkit)-/;
const NUMERIC_STRING: RegExp = /^\d+$/;
const UPPERCASE_PATTERN: RegExp = /([A-Z])/g;

export default class HtmlProvider implements ITextProvider {

    public export(editorState: EditorState, encode: boolean): string {
        const content = editorState.getCurrentContent();
        const blockMap: BlockMap = content.getBlockMap();
        return '';

        // const customStyleMap = editor.configStore.get("customStyleMap") || {};
        // const customBlockRenderMap = editor.configStore.get("blockRenderMap") || {};
        // const customStyleFn = editor.configStore.get("customStyleFn");
        // objectAssign(customStyleMap, DEFAULT_INLINE_STYLE);

        // return blockMap.map(block => {
        //     let resultText = "<div>";
        //     let lastPosition = 0;
        //     const text = block.getText();
        //     const blockType = block.getType();

        //     if (customBlockRenderMap.get(blockType)) {
        //         resultText = `<div style="${this.getStyleText(customBlockRenderMap.get(blockType).style || {})}">`;
        //     }

        //     const charMetaList = block.getCharacterList();

        //     let charEntity = null;
        //     let prevCharEntity = null;
        //     let ranges = [];
        //     let rangeStart = 0;
        //     for (let i = 0, len = text.length; i < len; i++) {
        //         prevCharEntity = charEntity;
        //         let meta: CharacterMetadata = charMetaList.get(i);
        //         charEntity = meta ? meta.getEntity() : null;
        //         if (i > 0 && charEntity !== prevCharEntity) {
        //             ranges.push([
        //                 prevCharEntity,
        //                 this.getStyleRanges(
        //                     text.slice(rangeStart, i),
        //                     charMetaList.slice(rangeStart, i)
        //                 ),
        //             ]);
        //             rangeStart = i;
        //         }
        //     }
        //     ranges.push([
        //         charEntity,
        //         this.getStyleRanges(
        //             text.slice(rangeStart),
        //             charMetaList.slice(rangeStart)
        //         ),
        //     ]);

        //     ranges.map(([entityKey, stylePieces]) => {
        //         let element = DEFAULT_ELEMENT;
        //         let content = stylePieces.map(([text, styleSet]) => {
        //             let encodedContent = this.encode(text);
        //             if (styleSet.size) {
        //                 let inlineStyle = {};
        //                 styleSet.forEach(item => {
        //                     if (customStyleMap.hasOwnProperty(item)) {
        //                         const currentStyle = customStyleMap[item];
        //                         inlineStyle = objectAssign(inlineStyle, currentStyle);
        //                     }
        //                 });
        //                 const costumedStyle = customStyleFn(styleSet);
        //                 inlineStyle = objectAssign(inlineStyle, costumedStyle);
        //                 return `<span style="${this.getStyleText(inlineStyle)}">${encodedContent}</span>`;
        //             }
        //             return `<span>${encodedContent}</span>`;
        //         }).join("");
        //         resultText += this.getEntityContent(entityKey, content);
        //     });

        //     resultText += "</div>";
        //     return resultText;
        // }).join("<br />\n");
    }

    public encode(input: string): string {
        return input
            .split('&').join('&amp;')
            .split('<').join('&lt;')
            .split('>').join('&gt;')
            .split('\xA0').join('&nbsp;')
            .split('\n').join('<br >' + '\n');
    }

    private encodeAttr(text: string): string {
        return text
            .split('&').join('&amp;')
            .split('<').join('&lt;')
            .split('>').join('&gt;')
            .split('"').join('&quot;');
    }

    // Lifted from: https://github.com/facebook/react/blob/master/src/renderers/dom/shared/CSSPropertyOperations.js
    private processStyleName(name: string): string {
        return name
            .replace(UPPERCASE_PATTERN, '-$1')
            .toLowerCase()
            .replace(VENDOR_PREFIX, '-$1-');
    }

    // Lifted from: https://github.com/facebook/react/blob/master/src/renderers/dom/shared/dangerousStyleValue.js
    private processStyleValue(name: string, value: string): string {
        let isNumeric;
        if (typeof value === 'string') {
            isNumeric = NUMERIC_STRING.test(value);
        } else {
            isNumeric = true;
            value = String(value);
        }
        if (!isNumeric || value === '0') {
            return value;
        } else {
            return value + 'px';
        }
    }

    private getStyleText(styleObject) {
        return Object.keys(styleObject).map(name => {
            const styleName: string = this.processStyleName(name);
            const styleValue: string = this.processStyleValue(name, styleObject[name]);
            return `${styleName}:${styleValue}`;
        }).join(';');
    }

    private getEntityContent(entityKey, content: string): string {
        if (entityKey) {
            const entity = Entity.get(entityKey);
            const entityData = entity.getData();
            if (entityData && entityData.export) {
                return entityData.export(content, entityData);
            }
        }
        return content;
    }

    private getStyleRanges(text: String, charMetaList: List<CharacterMetadata>) {
        let charStyle = EMPTY_SET;
        let prevCharStyle = EMPTY_SET;
        let ranges = [];
        let rangeStart = 0;
        for (let i = 0, len = text.length; i < len; i++) {
            prevCharStyle = charStyle;
            let meta = charMetaList.get(i);
            charStyle = meta ? meta.getStyle() : EMPTY_SET;
            if (i > 0 && !is(charStyle, prevCharStyle)) {
                ranges.push([text.slice(rangeStart, i), prevCharStyle]);
                rangeStart = i;
            }
        }
        ranges.push([text.slice(rangeStart), charStyle]);
        return ranges;
    }
}
