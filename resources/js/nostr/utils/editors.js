import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

export const editors = (Alpine) => ({

    initEditors() {

        let editor = new window.SimpleMDE({
            element: Alpine.$refs.editor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false,
            spellChecker: false,
        });

        editor.value(Alpine.commentValue);

        editor.codemirror.on('change', () => {
            Alpine.commentValue = editor.value();
        });

        const smileys = ["🫂", "🥰", "🎯", "💯"];

        let noteEditor = new window.SimpleMDE({
            element: Alpine.$refs.noteEditor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false,
            spellChecker: false,
        });

        noteEditor.value(Alpine.newNoteValue);

        noteEditor.codemirror.on('change', () => {
            Alpine.newNoteValue = noteEditor.value();
        });

        inlineAttachment.editors.codemirror4.attach(noteEditor.codemirror, {
            uploadUrl: '/upload-attachment',
            urlText: '{filename}',
            onFileUploadResponse: function(xhr) {
                console.log(JSON.parse(xhr.responseText), this.settings.jsonFieldName);
                const result = JSON.parse(xhr.responseText),
                    filename = result[this.settings.jsonFieldName];

                if (result && filename) {
                    let newValue;
                    if (typeof this.settings.urlText === 'function') {
                        newValue = this.settings.urlText.call(this, filename, result);
                    } else {
                        newValue = this.settings.urlText.replace(this.filenameTag, filename);
                    }
                    const text = this.editor.getValue().replace(this.lastValue, newValue);
                    this.editor.setValue(text);
                    this.settings.onFileUploaded.call(this, filename);
                }
                return false;
            }
        });

        const picker = new Picker({
            data,
            onEmojiSelect: (emoji) => {
                const pos = noteEditor.codemirror.getCursor();
                noteEditor.codemirror.setSelection(pos, pos);
                noteEditor.codemirror.replaceSelection(emoji.native);
            },
        });

        Alpine.$refs.picker.appendChild(picker);
    },

});
