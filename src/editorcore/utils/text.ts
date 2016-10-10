import * as DraftJS from 'draft-js';
import * as detectIndent from 'detect-indent';

var DEFAULT_INDENTATION = '    ';

export function getIndentation(text) {
    let result = detectIndent(text) as any;
    return result.indent || DEFAULT_INDENTATION;
}