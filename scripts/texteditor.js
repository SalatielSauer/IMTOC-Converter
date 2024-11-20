class TextEditor {
    constructor(parent) {
        this.forceLang = false;
        this.parent = parent;
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'texteditor_editor';
        this.textarea.setAttribute('spellcheck', false);

        this.pre = document.createElement('pre');
        this.pre.className = 'texteditor_pre';
        this.pre.setAttribute('aria-hidden', true);

        this.code = document.createElement('div');
        this.code.className = 'texteditor_code';

        this.textarea.addEventListener('input', () => {
            this.refreshHighlight();
        });

        this.textarea.addEventListener('scroll', () => {
            this.refreshScroll();
        });

        this.textarea.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
            this.refreshHighlight();
        });

        this.pre.appendChild(this.code);
        this.parent.appendChild(this.textarea);
        this.parent.appendChild(this.pre);
    }

    refreshScroll() {
        if (!this.code.firstChild) return;
        this.code.firstChild.scrollTop = this.textarea.scrollTop;
        this.code.firstChild.scrollLeft = this.textarea.scrollLeft;
    }

    async refreshHighlight() {
        this.code.textContent = this.textarea.value;
        let detectedLang = this.forceLang; // || detectLanguage(this.textarea.value);

        let langClass = `shj-lang-${detectedLang}`;
        if (!this.textarea.classList.contains(langClass)) {
            this.textarea.className = this.textarea.className.replace(/\bshj-lang-\S+/g, '');
            this.textarea.classList.add(langClass);
        }

        await highlightElement(this.code, detectedLang, 'multiline', { 'hideLineNumbers': true });

        this.refreshScroll();  // ensure scroll sync happens after content update
    }

    refreshText(text) {
        this.textarea.value = text;
        this.refreshHighlight();
    }

    handleKeyDown(e) {
        // indent + outdent logic
        const {selectionStart, selectionEnd, value} = this.textarea;
        if (e.key === 'Tab') {
            e.preventDefault();
            const startLineBreak = value.lastIndexOf('\n', selectionStart - 1);
            const endLineBreak = value.indexOf('\n', selectionEnd);
            const lineStart = startLineBreak + 1;
            const lineEnd = endLineBreak === -1 ? value.length : endLineBreak;
            const lines = value.substring(lineStart, lineEnd).split('\n');
            if (e.shiftKey) {
                const outdentedLines = lines.map(line =>
                    line.startsWith('\t') ? line.substring(1) : line.replace(/^ {1,4}/, '')
                );
                const newText = outdentedLines.join('\n');
                const reduction = value.substring(lineStart, lineEnd).length - newText.length;
                this.textarea.setRangeText(newText, lineStart, lineEnd, 'end');
                const newSelectionStart = Math.max(lineStart, selectionStart - reduction);
                const newSelectionEnd = selectionEnd - reduction;
                this.textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            } else {
                const indentedLines = lines.map(line => '\t' + line);
                const newText = indentedLines.join('\n');
                const addition = indentedLines.length;
                this.textarea.setRangeText(newText, lineStart, lineEnd, 'end');
                const newSelectionStart = selectionStart + 1;
                const newSelectionEnd = selectionEnd + addition;
                this.textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            }
        }
    }
}
