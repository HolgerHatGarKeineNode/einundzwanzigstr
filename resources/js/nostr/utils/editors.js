export const editors = (Alpine) => ({

    initEditors() {
        let editor = new window.SimpleMDE({
            element: Alpine.$refs.editor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false
        });

        editor.value(Alpine.commentValue);

        editor.codemirror.on('change', () => {
            Alpine.commentValue = editor.value();
        });

        let noteEditor = new window.SimpleMDE({
            element: Alpine.$refs.noteEditor,
            hideIcons: ['image', 'side-by-side', 'fullscreen'],
            toolbar: false
        });

        noteEditor.value(Alpine.newNoteValue);

        noteEditor.codemirror.on('change', () => {
            Alpine.newNoteValue = noteEditor.value();
        });

        inlineAttachment.editors.codemirror4.attach(noteEditor.codemirror, {
            uploadUrl: '/upload-attachment',
            onFileUploadResponse: function(xhr) {
                console.log(JSON.parse(xhr.responseText), this.settings.jsonFieldName);
                var result = JSON.parse(xhr.responseText),
                    filename = result[this.settings.jsonFieldName];

                if (result && filename) {
                    var newValue;
                    if (typeof this.settings.urlText === 'function') {
                        newValue = this.settings.urlText.call(this, filename, result);
                    } else {
                        newValue = this.settings.urlText.replace(this.filenameTag, filename);
                    }
                    var text = this.editor.getValue().replace(this.lastValue, newValue);
                    this.editor.setValue(text);
                    this.settings.onFileUploaded.call(this, filename);
                }
                return false;
            }
        });
    },

});
