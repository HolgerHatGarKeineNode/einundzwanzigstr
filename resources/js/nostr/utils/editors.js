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
    },

});
