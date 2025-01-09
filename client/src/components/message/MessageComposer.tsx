import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Send, Bold, Italic, Code, Paperclip, Smile } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

interface MessageComposerProps {
  onSend: (content: {
    blocks: Array<{ type: string; content: any }>;
    formattedText: string;
    rawText: string;
  }, files?: Array<{ name: string; type: string; size: number; url: string }>) => void;
  placeholder?: string;
}

export function MessageComposer({ onSend, placeholder = 'Type a message...' }: MessageComposerProps) {
  const [files, setFiles] = useState<Array<{ name: string; type: string; size: number; url: string }>>([]);
  const [showFilePond, setShowFilePond] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[40px] max-h-[200px] overflow-y-auto focus:outline-none'
      }
    }
  });

  const handleSend = useCallback(() => {
    if (!editor) return;

    const content = {
      blocks: [
        {
          type: 'text',
          content: editor.getJSON(),
        },
      ],
      formattedText: editor.getHTML(),
      rawText: editor.getText(),
    };

    onSend(content, files);
    editor.commands.clearContent();
    setFiles([]);
    setShowFilePond(false);
  }, [editor, files, onSend]);

  const handleFileUpload = (fileItems: any[]) => {
    const uploadedFiles = fileItems.map((fileItem) => ({
      name: fileItem.filename,
      type: fileItem.fileType,
      size: fileItem.fileSize,
      url: URL.createObjectURL(fileItem.file),
    }));
    setFiles(uploadedFiles);
  };

  const handleEmojiSelect = (emoji: any) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji.native).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilePond(prev => !prev)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleSend}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>

      {showFilePond && (
        <div className="mt-4">
          <FilePond
            files={files.map(file => file.url)}
            onupdatefiles={handleFileUpload}
            allowMultiple={true}
            maxFiles={10}
            maxFileSize="10MB"
            acceptedFileTypes={['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}