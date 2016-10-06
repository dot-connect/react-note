/// <reference path="../../typings/index.d.ts"/>

import { Entity, ContentState, BlockMap, EditorState } from "draft-js";
import { ITextProvider } from "../interface";

export default class TextProvider implements ITextProvider {

    public export(editorState: EditorState, encode: boolean): string {
        let content: ContentState = editorState.getCurrentContent();
        let blockMap: BlockMap = content.getBlockMap();
        return blockMap.map(block => {
            let resultText: string = "";
            let lastPosition: number = 0;
            const text = block.getText();
            block.findEntityRanges(function (character) {
                return !!character.getEntity();
            }, function (start, end) {
                var key = block.getEntityAt(start);
                const entityData = Entity.get(key).getData();
                resultText += text.slice(lastPosition, start);
                resultText += entityData && entityData.export ? entityData.export(entityData) : text.slice(start, end);
                lastPosition = end;
            });
            resultText += text.slice(lastPosition);
            return encode ? this.encode(resultText) : resultText;
        }).join(encode ? "<br />\n" : "\n");
    }
    
    public encode(text: string): string {
        return text
            .split("&").join("&amp;")
            .split("<").join("&lt;")
            .split(">").join("&gt;")
            .split("\xA0").join("&nbsp;")
            .split("\n").join("<br />" + "\n");
    }

    public decodeContent(text: string): string {
        return text.split("<br />" + "\n").join("\n");
    }
}