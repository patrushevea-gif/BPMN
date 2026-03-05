import { useMemo, useReducer, useState } from 'react';
import ReactFlow, { Background, Handle, MarkerType, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const CELL_WIDTH = 190;
const CELL_HEIGHT = 110;
const HEADER_HEIGHT = 48;
const LANE_LABEL_WIDTH = 240;
const FOOTER_ROW_HEIGHT = 130;

const palette = [
  { id: 'yellow', value: '#fef3c7', label: 'Желтый' },
  { id: 'orange', value: '#fed7aa', label: 'Оранжевый' },
  { id: 'blue', value: '#bfdbfe', label: 'Синий' },
  { id: 'green', value: '#bbf7d0', label: 'Зеленый' },
];

const edgeAnchors = [
  { id: 'left', label: 'Слева', position: Position.Left },
  { id: 'right', label: 'Справа', position: Position.Right },
  { id: 'top', label: 'Сверху', position: Position.Top },
  { id: 'bottom', label: 'Снизу', position: Position.Bottom },
];

const edgeTypes = [
  { id: 'smoothstep', label: 'Плавная' },
  { id: 'step', label: 'Ломаная' },
  { id: 'bezier', label: 'Кривая Безье' },
];

const initialData = {
  roles: [
    { id: 'role-1', title: 'Генеральный директор' },
    { id: 'role-2', title: 'Финансовый директор' },
    { id: 'role-3', title: 'Руководитель отдела персонала' },
    { id: 'role-4', title: 'Операционный директор' },
    { id: 'role-5', title: 'Руководитель структурного подразделения' },
  ],
  stages: Array.from({ length: 8 }, (_, index) => ({
    id: `stage-${index + 1}`,
    title: `${index + 1} этап`,
  })),
  footer: {
    product: {
      title: 'Продукт',
      values: {
        'stage-1': 'Матрица KPI и реестр сотрудников',
        'stage-2': 'Реестр ТОП-задач согласован руководителем',
        'stage-3': 'Отчет по показателям эффективности',
        'stage-4': 'Отчет по исполнительской дисциплине',
        'stage-5': 'Дашборд интегрированных показателей',
        'stage-6': 'Сводная ведомость согласования',
        'stage-7': 'Реестр ЗП из 3 потоков',
        'stage-8': 'Реестр согласован и утвержден',
      },
    },
    methodology: {
      title: 'Методика',
      values: {
        'stage-1': 'СТО СМК 27-2026',
        'stage-2': 'Регламент согласования',
        'stage-3': 'Валидация KPI до конца месяца',
        'stage-4': 'Порядок корректировок по замечаниям',
        'stage-5': 'Методика анализа эффективности',
        'stage-6': 'Порядок внесения корректировок',
        'stage-7': 'Положение об оплате труда',
        'stage-8': 'Положение о премировании',
      },
    },
  },
  tasks: [
    {
      id: 'task-1',
      roleId: 'role-1',
      stageId: 'stage-1',
      text: 'Утверждение премиального фонда\nи реестра сотрудников',
      color: '#fef3c7',
    },
    {
      id: 'task-2',
      roleId: 'role-5',
      stageId: 'stage-2',
      text: 'Согласование ТОП-задач',
      color: '#fef3c7',
    },
    {
      id: 'task-3',
      roleId: 'role-4',
      stageId: 'stage-3',
      text: 'Контроль и валидация показателей KPI',
      color: '#fef3c7',
    },
    {
      id: 'task-4',
      roleId: 'role-3',
      stageId: 'stage-5',
      text: 'Формирование отчета по эффективности',
      color: '#fef3c7',
    },
    {
      id: 'task-5',
      roleId: 'role-2',
      stageId: 'stage-7',
      text: 'Формирование реестра ЗП',
      color: '#fef3c7',
    },
  ],
  edges: [
    {
      id: 'edge-1',
      sourceTaskId: 'task-1',
      targetTaskId: 'task-2',
      color: '#111827',
      sourceAnchor: 'right',
      targetAnchor: 'left',
      lineType: 'smoothstep',
    },
    {
      id: 'edge-2',
      sourceTaskId: 'task-2',
      targetTaskId: 'task-3',
      color: '#f97316',
      sourceAnchor: 'right',
      targetAnchor: 'left',
      lineType: 'step',
    },
    {
      id: 'edge-3',
      sourceTaskId: 'task-3',
      targetTaskId: 'task-4',
      color: '#111827',
      sourceAnchor: 'right',
      targetAnchor: 'left',
      lineType: 'smoothstep',
    },
    {
      id: 'edge-4',
      sourceTaskId: 'task-4',
      targetTaskId: 'task-5',
      color: '#111827',
      sourceAnchor: 'right',
      targetAnchor: 'left',
      lineType: 'bezier',
    },
  ],
};

function EdgeAnchorNode() {
  return (
    <div className="h-full w-full">
      {edgeAnchors.map((anchor) => (
        <Handle
          key={anchor.id}
          id={anchor.id}
          type="source"
          position={anchor.position}
          isConnectable={false}
          style={{ width: 2, height: 2, border: 0, opacity: 0 }}
        />
      ))}
      {edgeAnchors.map((anchor) => (
        <Handle
          key={`target-${anchor.id}`}
          id={anchor.id}
          type="target"
          position={anchor.position}
          isConnectable={false}
          style={{ width: 2, height: 2, border: 0, opacity: 0 }}
        />
      ))}
    </div>
  );
}

function nextId(prefix, list) {
  const values = list
    .map((item) => Number.parseInt(item.id.replace(`${prefix}-`, ''), 10))
    .filter((n) => Number.isFinite(n));
  const next = values.length ? Math.max(...values) + 1 : 1;
  return `${prefix}-${next}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'add-stage': {
      const id = nextId('stage', state.stages);
      return {
        ...state,
        stages: [...state.stages, { id, title: `${state.stages.length + 1} этап` }],
        footer: {
          ...state.footer,
          product: {
            ...state.footer.product,
            values: { ...state.footer.product.values, [id]: '' },
          },
          methodology: {
            ...state.footer.methodology,
            values: { ...state.footer.methodology.values, [id]: '' },
          },
        },
      };
    }
    case 'remove-stage': {
      if (state.stages.length <= 1) return state;
      const removed = state.stages[state.stages.length - 1];
      const removedTasks = state.tasks.filter((task) => task.stageId === removed.id).map((task) => task.id);
      const { [removed.id]: _product, ...productValues } = state.footer.product.values;
      const { [removed.id]: _method, ...methodValues } = state.footer.methodology.values;
      return {
        ...state,
        stages: state.stages.slice(0, -1),
        tasks: state.tasks.filter((task) => task.stageId !== removed.id),
        edges: state.edges.filter(
          (edge) => !removedTasks.includes(edge.sourceTaskId) && !removedTasks.includes(edge.targetTaskId),
        ),
        footer: {
          ...state.footer,
          product: { ...state.footer.product, values: productValues },
          methodology: { ...state.footer.methodology, values: methodValues },
        },
      };
    }
    case 'add-role': {
      const id = nextId('role', state.roles);
      return {
        ...state,
        roles: [...state.roles, { id, title: `Новая роль ${state.roles.length + 1}` }],
      };
    }
    case 'remove-role': {
      if (state.roles.length <= 1) return state;
      const removed = state.roles[state.roles.length - 1];
      const removedTasks = state.tasks.filter((task) => task.roleId === removed.id).map((task) => task.id);
      return {
        ...state,
        roles: state.roles.slice(0, -1),
        tasks: state.tasks.filter((task) => task.roleId !== removed.id),
        edges: state.edges.filter(
          (edge) => !removedTasks.includes(edge.sourceTaskId) && !removedTasks.includes(edge.targetTaskId),
        ),
      };
    }
    case 'update-role':
      return {
        ...state,
        roles: state.roles.map((role) => (role.id === action.roleId ? { ...role, title: action.title } : role)),
      };
    case 'update-stage':
      return {
        ...state,
        stages: state.stages.map((stage) =>
          stage.id === action.stageId ? { ...stage, title: action.title } : stage,
        ),
      };
    case 'update-footer':
      return {
        ...state,
        footer: {
          ...state.footer,
          [action.section]: {
            ...state.footer[action.section],
            values: {
              ...state.footer[action.section].values,
              [action.stageId]: action.value,
            },
          },
        },
      };
    case 'create-task': {
      if (state.tasks.some((task) => task.roleId === action.roleId && task.stageId === action.stageId)) {
        return state;
      }
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: nextId('task', state.tasks),
            roleId: action.roleId,
            stageId: action.stageId,
            text: 'Новая задача',
            color: '#fef3c7',
          },
        ],
      };
    }
    case 'update-task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, [action.field]: action.value } : task,
        ),
      };
    case 'delete-task':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        edges: state.edges.filter(
          (edge) => edge.sourceTaskId !== action.taskId && edge.targetTaskId !== action.taskId,
        ),
      };
    case 'add-edge': {
      if (!action.sourceTaskId || !action.targetTaskId || action.sourceTaskId === action.targetTaskId) return state;
      const exists = state.edges.some(
        (edge) => edge.sourceTaskId === action.sourceTaskId && edge.targetTaskId === action.targetTaskId,
      );
      if (exists) return state;
      return {
        ...state,
        edges: [
          ...state.edges,
          {
            id: nextId('edge', state.edges),
            sourceTaskId: action.sourceTaskId,
            targetTaskId: action.targetTaskId,
            color: action.color,
            sourceAnchor: action.sourceAnchor,
            targetAnchor: action.targetAnchor,
            lineType: action.lineType,
          },
        ],
      };
    }
    case 'update-edge':
      return {
        ...state,
        edges: state.edges.map((edge) =>
          edge.id === action.edgeId ? { ...edge, [action.field]: action.value } : edge,
        ),
      };
    case 'remove-edge':
      return {
        ...state,
        edges: state.edges.filter((edge) => edge.id !== action.edgeId),
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialData);
  const [sourceTaskId, setSourceTaskId] = useState('');
  const [targetTaskId, setTargetTaskId] = useState('');
  const [edgeColor, setEdgeColor] = useState('#111827');
  const [sourceAnchor, setSourceAnchor] = useState('right');
  const [targetAnchor, setTargetAnchor] = useState('left');
  const [lineType, setLineType] = useState('smoothstep');

  const nodeTypes = useMemo(() => ({ anchor: EdgeAnchorNode }), []);

  const taskMap = useMemo(() => new Map(state.tasks.map((task) => [task.id, task])), [state.tasks]);

  const flowNodes = useMemo(
    () =>
      state.tasks.map((task) => {
        const stageIndex = state.stages.findIndex((stage) => stage.id === task.stageId);
        const roleIndex = state.roles.findIndex((role) => role.id === task.roleId);
        return {
          id: task.id,
          position: {
            x: LANE_LABEL_WIDTH + stageIndex * CELL_WIDTH + 8,
            y: HEADER_HEIGHT + roleIndex * CELL_HEIGHT + 8,
          },
          data: { label: task.text },
          style: {
            width: CELL_WIDTH - 16,
            height: CELL_HEIGHT - 16,
            border: 'none',
            background: 'transparent',
          },
          type: 'anchor',
          draggable: false,
          selectable: false,
        };
      }),
    [state.roles, state.stages, state.tasks],
  );

  const flowEdges = useMemo(
    () =>
      state.edges
        .filter((edge) => taskMap.has(edge.sourceTaskId) && taskMap.has(edge.targetTaskId))
        .map((edge) => ({
          id: edge.id,
          source: edge.sourceTaskId,
          target: edge.targetTaskId,
          sourceHandle: edge.sourceAnchor || 'right',
          targetHandle: edge.targetAnchor || 'left',
          type: edge.lineType || 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: edge.color },
          style: { stroke: edge.color, strokeWidth: 2.2 },
        })),
    [state.edges, taskMap],
  );

  const handleExport = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bpmn-lite-process.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full bg-slate-100 p-4">
      <div className="mb-4 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'add-stage' })}>Добавить этап</button>
          <button className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'remove-stage' })}>Удалить этап</button>
          <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'add-role' })}>Добавить роль</button>
          <button className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'remove-role' })}>Удалить роль</button>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={handleExport}>Выгрузить JSON</button>
        </div>

        <div className="grid gap-2 md:grid-cols-7">
          <select value={sourceTaskId} onChange={(e) => setSourceTaskId(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            <option value="">Источник связи</option>
            {state.tasks.map((task) => (
              <option key={`source-${task.id}`} value={task.id}>{task.text}</option>
            ))}
          </select>
          <select value={targetTaskId} onChange={(e) => setTargetTaskId(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            <option value="">Цель связи</option>
            {state.tasks.map((task) => (
              <option key={`target-${task.id}`} value={task.id}>{task.text}</option>
            ))}
          </select>
          <select value={edgeColor} onChange={(e) => setEdgeColor(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            <option value="#111827">Черная линия</option>
            <option value="#f97316">Оранжевая линия</option>
          </select>
          <select value={sourceAnchor} onChange={(e) => setSourceAnchor(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            {edgeAnchors.map((anchor) => (
              <option key={`from-${anchor.id}`} value={anchor.id}>Из: {anchor.label}</option>
            ))}
          </select>
          <select value={targetAnchor} onChange={(e) => setTargetAnchor(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            {edgeAnchors.map((anchor) => (
              <option key={`to-${anchor.id}`} value={anchor.id}>В: {anchor.label}</option>
            ))}
          </select>
          <select value={lineType} onChange={(e) => setLineType(e.target.value)} className="rounded border border-slate-300 p-2 text-sm">
            {edgeTypes.map((typeItem) => (
              <option key={typeItem.id} value={typeItem.id}>{typeItem.label}</option>
            ))}
          </select>
          <button
            className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white"
            onClick={() =>
              dispatch({
                type: 'add-edge',
                sourceTaskId,
                targetTaskId,
                color: edgeColor,
                sourceAnchor,
                targetAnchor,
                lineType,
              })
            }
          >
            Добавить стрелку
          </button>
        </div>
      </div>

      <div className="relative overflow-auto rounded-xl border border-slate-300 bg-white shadow-sm" style={{ height: 'calc(100% - 220px)' }}>
        <div
          className="relative"
          style={{
            minWidth: LANE_LABEL_WIDTH + state.stages.length * CELL_WIDTH,
            minHeight: HEADER_HEIGHT + state.roles.length * CELL_HEIGHT + FOOTER_ROW_HEIGHT * 2,
          }}
        >
          <div className="sticky left-0 top-0 z-20 grid" style={{ gridTemplateColumns: `${LANE_LABEL_WIDTH}px repeat(${state.stages.length}, ${CELL_WIDTH}px)` }}>
            <div className="border border-slate-400 bg-sky-100 p-2 text-center text-sm font-semibold">Роли</div>
            {state.stages.map((stage) => (
              <textarea
                key={stage.id}
                value={stage.title}
                onChange={(e) => dispatch({ type: 'update-stage', stageId: stage.id, title: e.target.value })}
                className="h-[48px] resize-none border border-slate-400 bg-sky-100 p-2 text-center text-sm font-semibold"
              />
            ))}
          </div>

          {state.roles.map((role) => (
            <div key={role.id} className="grid" style={{ gridTemplateColumns: `${LANE_LABEL_WIDTH}px repeat(${state.stages.length}, ${CELL_WIDTH}px)` }}>
              <textarea
                value={role.title}
                onChange={(e) => dispatch({ type: 'update-role', roleId: role.id, title: e.target.value })}
                className="h-[110px] resize-none border border-slate-400 bg-sky-50 p-2 text-sm font-medium"
              />
              {state.stages.map((stage) => {
                const task = state.tasks.find((entry) => entry.roleId === role.id && entry.stageId === stage.id);
                return (
                  <div
                    key={`${role.id}-${stage.id}`}
                    className="relative border border-slate-300"
                    style={{ height: CELL_HEIGHT }}
                    title="Двойной клик для создания задачи"
                    onDoubleClick={() => dispatch({ type: 'create-task', roleId: role.id, stageId: stage.id })}
                  >
                    {task ? (
                      <div className="absolute inset-1 z-10 rounded border-2 border-slate-900 p-1" style={{ backgroundColor: task.color }}>
                        <textarea
                          value={task.text}
                          onChange={(e) => dispatch({ type: 'update-task', taskId: task.id, field: 'text', value: e.target.value })}
                          className="h-[66px] w-full resize-none bg-transparent text-center text-xs"
                        />
                        <div className="mt-1 flex items-center gap-1">
                          <select
                            value={task.color}
                            onChange={(e) => dispatch({ type: 'update-task', taskId: task.id, field: 'color', value: e.target.value })}
                            className="w-full rounded border border-slate-400 bg-white text-[11px]"
                          >
                            {palette.map((color) => (
                              <option key={color.id} value={color.value}>{color.label}</option>
                            ))}
                          </select>
                          <button className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white" onClick={() => dispatch({ type: 'delete-task', taskId: task.id })}>x</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {['product', 'methodology'].map((section) => (
            <div key={section} className="grid" style={{ gridTemplateColumns: `${LANE_LABEL_WIDTH}px repeat(${state.stages.length}, ${CELL_WIDTH}px)` }}>
              <div className={`border border-slate-400 p-2 text-sm font-semibold ${section === 'product' ? 'bg-green-200' : 'bg-green-100'}`}>
                {state.footer[section].title}
              </div>
              {state.stages.map((stage) => (
                <textarea
                  key={`${section}-${stage.id}`}
                  value={state.footer[section].values[stage.id] || ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'update-footer',
                      section,
                      stageId: stage.id,
                      value: e.target.value,
                    })
                  }
                  className="h-[130px] resize-none border border-slate-400 bg-slate-50 p-2 text-xs"
                />
              ))}
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 z-0">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              fitView={false}
              minZoom={1}
              maxZoom={1}
              zoomOnScroll={false}
              panOnDrag={false}
              panOnScroll={false}
              nodesDraggable={false}
              elementsSelectable={false}
            >
              <Background gap={18} size={0.25} color="#d9dee8" />
            </ReactFlow>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold">Редактор стрелок (для возвратов и циклов)</h3>
        <div className="space-y-2">
          {state.edges.map((edge) => (
            <div key={edge.id} className="grid gap-2 rounded border border-slate-200 p-2 md:grid-cols-7">
              <select
                value={edge.sourceTaskId}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'sourceTaskId', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                {state.tasks.map((task) => (
                  <option key={`edit-source-${edge.id}-${task.id}`} value={task.id}>{task.text}</option>
                ))}
              </select>
              <select
                value={edge.targetTaskId}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'targetTaskId', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                {state.tasks.map((task) => (
                  <option key={`edit-target-${edge.id}-${task.id}`} value={task.id}>{task.text}</option>
                ))}
              </select>
              <select
                value={edge.color}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'color', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                <option value="#111827">Черная</option>
                <option value="#f97316">Оранжевая</option>
              </select>
              <select
                value={edge.sourceAnchor || 'right'}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'sourceAnchor', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                {edgeAnchors.map((anchor) => (
                  <option key={`edit-from-${edge.id}-${anchor.id}`} value={anchor.id}>Из: {anchor.label}</option>
                ))}
              </select>
              <select
                value={edge.targetAnchor || 'left'}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'targetAnchor', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                {edgeAnchors.map((anchor) => (
                  <option key={`edit-to-${edge.id}-${anchor.id}`} value={anchor.id}>В: {anchor.label}</option>
                ))}
              </select>
              <select
                value={edge.lineType || 'smoothstep'}
                onChange={(e) => dispatch({ type: 'update-edge', edgeId: edge.id, field: 'lineType', value: e.target.value })}
                className="rounded border border-slate-300 p-2 text-xs"
              >
                {edgeTypes.map((typeItem) => (
                  <option key={`edit-type-${edge.id}-${typeItem.id}`} value={typeItem.id}>{typeItem.label}</option>
                ))}
              </select>
              <button className="rounded bg-red-500 px-2 py-1 text-xs text-white" onClick={() => dispatch({ type: 'remove-edge', edgeId: edge.id })}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold">Базовая структура JSON процесса</summary>
        <pre className="mt-3 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  );
}

export default App;
