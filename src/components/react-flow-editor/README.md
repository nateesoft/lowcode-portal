# ReactFlow Editor Refactor

การ refactor ReactFlowPage.tsx เดิมที่มีขนาด 2,582 lines ให้แยกเป็น components ที่จัดการได้ง่ายขึ้น

## โครงสร้างไฟล์

```
react-flow-editor/
├── index.ts                          # Main exports
├── README.md                         # Documentation  
├── ReactFlowEditor.tsx               # Main editor component
├── nodes/                            # Node components
│   ├── index.ts
│   └── CustomNode.tsx               # Custom node implementation
├── edges/                            # Edge components
│   ├── index.ts
│   └── CustomEdge.tsx               # Custom edge implementation
├── panels/                           # Editor panels
│   ├── NodePalette.tsx              # Draggable node palette
│   └── FlowToolbar.tsx              # Top toolbar
├── hooks/                            # Flow-specific hooks
│   ├── useFlowState.ts              # Flow state management
│   └── useFlowExecution.ts          # Flow execution logic
└── utils/                            # Flow utilities
    └── index.ts                     # Validation and export utilities
```

## การใช้งาน

### แทนที่ ReactFlowPage.tsx เดิม

```tsx
// เดิม
import ReactFlowPage from '@/components/pages/ReactFlowPage';

// ใหม่
import { ReactFlowEditor } from '@/components/react-flow-editor';

function MyApp() {
  return <ReactFlowEditor projectId="123" />;
}
```

### ใช้ Components แยกส่วน

```tsx
import { 
  ReactFlowEditor, 
  NodePalette, 
  FlowToolbar,
  useFlowState,
  useFlowExecution 
} from '@/components/react-flow-editor';

// Custom flow editor
function CustomFlowEditor() {
  const flowState = useFlowState();
  const { executeFlow } = useFlowExecution();
  
  return (
    <div>
      <FlowToolbar 
        onSave={() => console.log('Save')}
        onExecute={() => executeFlow(flowState.nodes, flowState.edges)}
      />
      <NodePalette 
        isOpen={true} 
        onNodeDrag={(e, template) => console.log('Drag', template)}
      />
      {/* Your custom flow canvas */}
    </div>
  );
}
```

### ใช้ Hooks

```tsx
import { useFlowState, useFlowExecution } from '@/components/react-flow-editor';

function MyFlowComponent() {
  const {
    nodes,
    edges,
    hasUnsavedChanges,
    addNode,
    deleteNode,
    onNodesChange,
    onEdgesChange,
    onConnect
  } = useFlowState();

  const { 
    executionState,
    executeFlow,
    validateFlow 
  } = useFlowExecution();

  const handleExecute = async () => {
    const validation = validateFlow(nodes, edges);
    if (validation.isValid) {
      await executeFlow(nodes, edges);
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
}
```

## Features

### 1. **Modular Node System**
- CustomNode component ที่ support resize, delete, และ properties
- Drag & drop จาก NodePalette
- Visual execution feedback

### 2. **Advanced Edge System**
- CustomEdge ที่สามารถ add node ระหว่าง edge ได้
- Edge labeling และ styling
- Delete edge functionality

### 3. **Flow State Management**
- useFlowState hook สำหรับจัดการ nodes และ edges
- Auto-save detection
- Undo/redo support (planned)

### 4. **Flow Execution**
- useFlowExecution hook สำหรับ execute flow
- Topological sorting สำหรับ execution order
- Visual execution feedback
- Error handling และ validation

### 5. **Collaborative Features**
- Integration กับ existing collaboration components
- Real-time cursors และ indicators
- Multi-user editing support

## Component APIs

### ReactFlowEditor Props
```tsx
interface ReactFlowEditorProps {
  projectId?: string;
}
```

### NodePalette Props
```tsx
interface NodePaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onNodeDrag: (event: React.DragEvent, nodeTemplate: NodeTemplate) => void;
}
```

### FlowToolbar Props
```tsx
interface FlowToolbarProps {
  projectName: string;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onExecute: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowPalette: () => void;
  onShowVersions: () => void;
  onShowCollaboration: () => void;
}
```

## Migration Guide

### ขั้นตอนการ migrate

1. **Install และ Test**
   ```bash
   # ตรวจสอบ imports
   npm run type-check
   ```

2. **แทนที่ Component**
   ```tsx
   // ใน pages/reactflow.tsx
   - import ReactFlowPage from '@/components/pages/ReactFlowPage';
   + import { ReactFlowEditor } from '@/components/react-flow-editor';
   ```

3. **ปรับ Props**
   ```tsx
   // Props structure อาจแตกต่างเล็กน้อย
   <ReactFlowEditor projectId={projectId} />
   ```

4. **ทดสอบ Features**
   - Drag & drop nodes
   - Create connections
   - Execute flow
   - Save/load functionality

### ข้อดีของ Refactor

1. **Maintainability** - แยก concerns ชัดเจน
2. **Reusability** - Components สามารถนำไปใช้ที่อื่นได้
3. **Testability** - Test แต่ละ component แยกได้
4. **Performance** - Lazy loading และ better re-renders
5. **Extensibility** - ง่ายต่อการเพิ่ม features ใหม่

### Backward Compatibility

- API calls ยังคงใช้ structure เดิม
- Props interface compatible กับ ReactFlowPage เดิม
- Existing modals และ panels ยังใช้ได้

## Future Enhancements

1. **Additional Node Types**
   - Conditional nodes
   - Loop nodes  
   - Custom JavaScript nodes

2. **Advanced Features**
   - Undo/redo system
   - Flow templates
   - Node grouping
   - Advanced validation rules

3. **Performance Optimizations**
   - Virtual scrolling for large flows
   - Node virtualization
   - Optimized re-renders

4. **Export/Import**
   - JSON export/import
   - Visual export (PNG/SVG)
   - Template sharing