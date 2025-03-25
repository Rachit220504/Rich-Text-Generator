import './App.scss';
import './TiptapEditor.css'; // New stylesheet for editor styles

import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Sample variables that would be available for insertion
const variables = [
  { id: '1', label: 'First Name', value: '{{firstName}}' },
  { id: '2', label: 'Last Name', value: '{{lastName}}' },
  { id: '3', label: 'Email', value: '{{email}}' },
  { id: '4', label: 'Company', value: '{{company}}' },
  { id: '5', label: 'Phone', value: '{{phone}}' },
  { id: '6', label: 'Address', value: '{{address}}' },
  { id: '7', label: 'Date', value: '{{date}}' },
  { id: '8', label: 'Order Number', value: '{{orderNumber}}' },
];

interface Variable {
  id: string;
  label: string;
  value: string;
}

// Variable suggestion component
const VariableSuggestion = ({
  items,
  command,
}: {
  items: Variable[];
  command: (item: Variable) => void;
}) => {
  return (
    <div className="variable-suggestion">
      <h3>Insert variable</h3>
      <div className="variable-list">
        {items.map((item, index) => (
          <button key={index} className="variable-item" onClick={() => command(item)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Create a variable node extension
const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      value: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
        getAttrs: (el: any) => ({
          id: el.getAttribute('data-id'),
          label: el.getAttribute('data-label'),
          value: el.getAttribute('data-value'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-variable': '',
        'data-id': node.attrs.id,
        'data-label': node.attrs.label,
        'data-value': node.attrs.value,
        class: 'variable-token',
      },
      node.attrs.label,
    ];
  },
});

// Create a variable suggestion plugin
const variableSuggestion = {
  items: ({ query }: { query: string }) => {
    return variables
      .filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.value.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);
  },

  render: () => {
    let component: ReactRenderer<typeof VariableSuggestion> | null = null;

    let popup: Instance<Props> | null = null;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(VariableSuggestion, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })[0];
      },

      onUpdate(props: any) {
        component?.updateProps(props);
        popup?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup?.hide();
          return true;
        }
        return (component?.ref as any)?.onKeyDown?.(props) ?? false;

      },

      onExit() {
        popup?.destroy();
        component?.destroy();
      },
    };
  },

  command: ({ editor, range, props }: { editor: any; range: any; props: Variable }) => {
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent({
        type: 'variable',
        attrs: {
          id: props.id,
          label: props.label,
          value: props.value,
        },
      })
      .run();
  },
};


// Create a variable trigger extension
const VariableTrigger = Extension.create({
  name: 'variableTrigger',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '{{',
        command: variableSuggestion.command,
        items: variableSuggestion.items,
        render: variableSuggestion.render,
      }),
    ]
  },
})

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  
  const [showVariables, setShowVariables] = useState(false)

  if (!editor) {
    return null
  }

  const formatButtonClass = (isActive : boolean) => 
    `toolbar-btn ${isActive ? 'is-active' : ''}`;

  const handleVariableSelect = (variable : Variable) => {
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: {
        id: variable.id,
        label: variable.label,
        value: variable.value,
      },
    }).run()
    
    setShowVariables(false)
  }

  return (
    <div className="editor-toolbar">
      <div className="toolbar-section">
        <button
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={formatButtonClass(editor.isActive('bold'))}
        >
          <b>B</b>
        </button>
        <button
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={formatButtonClass(editor.isActive('italic'))}
        >
          <i>I</i>
        </button>
        <button
          title="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={formatButtonClass(editor.isActive('strike'))}
        >
          <s>S</s>
        </button>
        <button
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={formatButtonClass(editor.isActive('code'))}
        >
          <code>&lt;/&gt;</code>
        </button>
      </div>

      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <button
          title="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={formatButtonClass(editor.isActive('paragraph'))}
        >
          ¶
        </button>
        <button
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={formatButtonClass(editor.isActive('heading', { level: 1 }))}
        >
          H1
        </button>
        <button
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={formatButtonClass(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>
        <div className="toolbar-dropdown">
          <button className="toolbar-btn dropdown-toggle">
            More...
          </button>
          <div className="dropdown-content">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={formatButtonClass(editor.isActive('heading', { level: 3 }))}
            >
              H3
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={formatButtonClass(editor.isActive('heading', { level: 4 }))}
            >
              H4
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              className={formatButtonClass(editor.isActive('heading', { level: 5 }))}
            >
              H5
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
              className={formatButtonClass(editor.isActive('heading', { level: 6 }))}
            >
              H6
            </button>
          </div>
        </div>
      </div>
      
      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        <button
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={formatButtonClass(editor.isActive('bulletList'))}
        >
          • List
        </button>
        <button
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={formatButtonClass(editor.isActive('orderedList'))}
        >
          1. List
        </button>
        <button
          title="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={formatButtonClass(editor.isActive('codeBlock'))}
        >
          &lt;/&gt;
        </button>
        <button
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={formatButtonClass(editor.isActive('blockquote'))}
        >
          "
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <div className="color-picker">
          <button
            title="Text Color"
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={formatButtonClass(editor.isActive('textStyle', { color: '#958DF1' }))}
          >
            <span className="color-swatch" style={{ backgroundColor: '#958DF1' }}></span>
          </button>
          <div className="color-dropdown">
            {['#E53935', '#8BC34A', '#03A9F4', '#FFC107', '#607D8B', '#000000'].map(color => (
              <button 
                key={color}
                className="color-option" 
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <button
          title="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-btn"
        >
          —
        </button>
        <button
          title="Hard Break"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="toolbar-btn"
        >
          ↵
        </button>
      </div>

      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <button
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="toolbar-btn"
        >
          ↩
        </button>
        <button
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="toolbar-btn"
        >
          ↪
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <button
          title="Clear Marks"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="toolbar-btn"
        >
          Clear Marks
        </button>
        <button
          title="Clear Nodes"
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="toolbar-btn"
        >
          Clear Nodes
        </button>
      </div>

      <div className="toolbar-divider"></div>
      
      <div className="toolbar-section">
        <div className="variable-dropdown">
          <button
            title="Insert Variable"
            className="toolbar-btn variable-btn"
            onClick={() => setShowVariables(!showVariables)}
          >
            Insert Variable
          </button>A
          {showVariables && (
            <div className="variable-dropdown-content">
              {variables.map((variable) => (
                <button
                  key={variable.id}
                  className="variable-dropdown-item"
                  onClick={() => handleVariableSelect(variable)}
                >
                  {variable.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({}), // Removed 'types'
  TextStyle.configure(), // Removed 'types'
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  ListItem, // Include ListItem separately
  VariableNode,
  VariableTrigger,
];


const content = `
<h2>
  Hi there,
</h2>
<p>
  This is a <em>basic</em> example of <strong>Tiptap</strong> with variable insertion. Try typing "{{" to trigger the variable suggestion popup!
</p>
<ul>
  <li>
    That's a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  You can also use the "Insert Variable" button in the toolbar to add template variables.
</p>
<blockquote>
  Variables make templates powerful and personalized!
</blockquote>
`

export default () => {
  return (
    <div className="tiptap-editor-container">
      <div className="tiptap-editor"> {/* Moved className here */}
        <EditorProvider
          slotBefore={<MenuBar />}
          extensions={extensions}
          content={content}
          editorProps={{
            attributes: {
              class: 'tiptap-content',
            },
          }}
        />
      </div>
    </div>
  );
};
