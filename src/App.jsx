import { useMemo, useReducer } from 'react';
import ReactFlow, { Background, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

const CELL_WIDTH = 160;
const CELL_HEIGHT = 92;
const HEADER_HEIGHT = 44;
const LANE_LABEL_WIDTH = 220;
const FOOTER_ROW_HEIGHT = 120;

const palette = [
  { id: 'yellow', value: '#fef3c7', label: 'Желтый' },
  { id: 'orange', value: '#fdba74', label: 'Оранжевый' },
  { id: 'blue', value: '#bfdbfe', label: 'Синий' },
  { id: 'green', value: '#bbf7d0', label: 'Зеленый' },
];

const initialData = {
  roles: [
    { id: 'role-1', title: 'Генеральный директор' },
    { id: 'role-2', title: 'Финансовый директор' },
    { id: 'role-3', title: 'Руководитель отдела персонала' },
    { id: 'role-4', title: 'Операционный директор' },
  ],
  stages: [
    { id: 'stage-1', title: '1 этап' },
    { id: 'stage-2', title: '2 этап' },
    { id: 'stage-3', title: '3 этап' },
    { id: 'stage-4', title: '4 этап' },
    { id: 'stage-5', title: '5 этап' },
  ],
  footer: {
    product: {
      title: 'Продукт',
      values: {
        'stage-1': 'Матрица KPI и реестр сотрудников',
        'stage-2': 'Согласованный ТОП-план',
        'stage-3': 'Отчет эффективности',
        'stage-4': 'Сводка KPI',
        'stage-5': 'Реестр зарплаты',
      },
    },
    methodology: {
      title: 'Методика',
      values: {
        'stage-1': 'СТО СМК 27-2026',
        'stage-2': 'Регламент согласования',
        'stage-3': 'Порядок ежемесячного контроля',
        'stage-4': 'Методика корректировок',
        'stage-5': 'Положение о премировании',
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
      roleId: 'role-3',
      stageId: 'stage-2',
      text: 'Согласование ТОП-задач',
      color: '#fef3c7',
    },
    {
      id: 'task-3',
      roleId: 'role-4',
      stageId: 'stage-3',
      text: 'Контроль исполнения',
      color: '#fef3c7',
    },
    {
      id: 'task-4',
      roleId: 'role-2',
      stageId: 'stage-5',
      text: 'Формирование реестра ЗП',
      color: '#fef3c7',
    },
  ],
  edges: [
    { id: 'edge-1', sourceTaskId: 'task-1', targetTaskId: 'task-2', color: '#111827' },
    { id: 'edge-2', sourceTaskId: 'task-2', targetTaskId: 'task-3', color: '#f97316' },
    { id: 'edge-3', sourceTaskId: 'task-3', targetTaskId: 'task-4', color: '#111827' },
  ],
};

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
      const stage = { id, title: `${state.stages.length + 1} этап` };
      return {
        ...state,
        stages: [...state.stages, stage],
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
      const stages = state.stages.slice(0, -1);
      const { [removed.id]: _, ...productValues } = state.footer.product.values;
      const { [removed.id]: __, ...methodValues } = state.footer.methodology.values;
      return {
        ...state,
        stages,
        tasks: state.tasks.filter((task) => task.stageId !== removed.id),
        edges: state.edges.filter(
          (edge) =>
            !state.tasks
              .filter((task) => task.stageId === removed.id)
              .some((task) => task.id === edge.sourceTaskId || task.id === edge.targetTaskId),
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
    case 'update-role': {
      return {
        ...state,
        roles: state.roles.map((role) => (role.id === action.roleId ? { ...role, title: action.title } : role)),
      };
    }
    case 'update-stage': {
      return {
        ...state,
        stages: state.stages.map((stage) =>
          stage.id === action.stageId ? { ...stage, title: action.title } : stage,
        ),
      };
    }
    case 'update-footer': {
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
    }
    case 'create-task': {
      if (state.tasks.some((task) => task.stageId === action.stageId && task.roleId === action.roleId)) {
        return state;
      }
      const id = nextId('task', state.tasks);
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id,
            roleId: action.roleId,
            stageId: action.stageId,
            text: 'Новая задача',
            color: '#fef3c7',
          },
        ],
      };
    }
    case 'update-task': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, [action.field]: action.value } : task,
        ),
      };
    }
    case 'delete-task': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
        edges: state.edges.filter(
          (edge) => edge.sourceTaskId !== action.taskId && edge.targetTaskId !== action.taskId,
        ),
      };
    }
    case 'add-edge': {
      if (!action.sourceTaskId || !action.targetTaskId || action.sourceTaskId === action.targetTaskId) {
        return state;
      }
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
          },
        ],
      };
    }
    case 'remove-edge': {
      return { ...state, edges: state.edges.filter((edge) => edge.id !== action.edgeId) };
    }
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialData);

  const taskMap = useMemo(() => {
    const map = new Map();
    state.tasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [state.tasks]);

  const flowNodes = useMemo(() => {
    return state.tasks.map((task) => {
      const stageIndex = state.stages.findIndex((stage) => stage.id === task.stageId);
      const roleIndex = state.roles.findIndex((role) => role.id === task.roleId);
      return {
        id: task.id,
        position: {
          x: LANE_LABEL_WIDTH + stageIndex * CELL_WIDTH + 12,
          y: HEADER_HEIGHT + roleIndex * CELL_HEIGHT + 10,
        },
        data: { label: task.text },
        style: {
          width: CELL_WIDTH - 24,
          height: CELL_HEIGHT - 20,
          background: task.color,
          border: '2px solid #111827',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          whiteSpace: 'pre-line',
          padding: '6px',
        },
        draggable: false,
        selectable: false,
      };
    });
  }, [state.roles, state.stages, state.tasks]);

  const flowEdges = useMemo(() => {
    return state.edges
      .filter((edge) => taskMap.has(edge.sourceTaskId) && taskMap.has(edge.targetTaskId))
      .map((edge) => ({
        id: edge.id,
        source: edge.sourceTaskId,
        target: edge.targetTaskId,
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: edge.color },
        style: { strokeWidth: 2, stroke: edge.color },
      }));
  }, [state.edges, taskMap]);

  return (
    <div className="h-full w-full p-4">
      <div className="mb-4 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'add-stage' })}>Добавить этап</button>
          <button className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'remove-stage' })}>Удалить этап</button>
          <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'add-role' })}>Добавить роль</button>
          <button className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-white" onClick={() => dispatch({ type: 'remove-role' })}>Удалить роль</button>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <select id="source" className="rounded border border-slate-300 p-2 text-sm">
            <option value="">Источник связи</option>
            {state.tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.text}</option>
            ))}
          </select>
          <select id="target" className="rounded border border-slate-300 p-2 text-sm">
            <option value="">Цель связи</option>
            {state.tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.text}</option>
            ))}
          </select>
          <select id="edge-color" className="rounded border border-slate-300 p-2 text-sm" defaultValue="#111827">
            <option value="#111827">Черная линия</option>
            <option value="#f97316">Оранжевая линия</option>
          </select>
          <button
            className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              const sourceTaskId = document.getElementById('source').value;
              const targetTaskId = document.getElementById('target').value;
              const color = document.getElementById('edge-color').value;
              dispatch({ type: 'add-edge', sourceTaskId, targetTaskId, color });
            }}
          >
            Добавить стрелку
          </button>
        </div>
      </div>

      <div className="relative overflow-auto rounded-xl border border-slate-300 bg-white shadow-sm" style={{ height: 'calc(100% - 140px)' }}>
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
                className="h-[44px] resize-none border border-slate-400 bg-sky-100 p-2 text-center text-sm font-semibold"
              />
            ))}
          </div>

          {state.roles.map((role, roleIndex) => (
            <div key={role.id} className="grid" style={{ gridTemplateColumns: `${LANE_LABEL_WIDTH}px repeat(${state.stages.length}, ${CELL_WIDTH}px)` }}>
              <textarea
                value={role.title}
                onChange={(e) => dispatch({ type: 'update-role', roleId: role.id, title: e.target.value })}
                className="h-[92px] resize-none border border-slate-400 bg-sky-50 p-2 text-sm font-medium"
              />
              {state.stages.map((stage) => {
                const task = state.tasks.find((entry) => entry.roleId === role.id && entry.stageId === stage.id);
                return (
                  <div
                    key={`${role.id}-${stage.id}`}
                    className="relative border border-slate-300"
                    style={{ height: CELL_HEIGHT }}
                    onDoubleClick={() => dispatch({ type: 'create-task', roleId: role.id, stageId: stage.id })}
                  >
                    {task && (
                      <div className="absolute inset-1 z-10 rounded border-2 border-slate-900 p-1" style={{ backgroundColor: task.color }}>
                        <textarea
                          value={task.text}
                          onChange={(e) => dispatch({ type: 'update-task', taskId: task.id, field: 'text', value: e.target.value })}
                          className="h-[60px] w-full resize-none bg-transparent text-center text-xs"
                        />
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <select
                            value={task.color}
                            onChange={(e) => dispatch({ type: 'update-task', taskId: task.id, field: 'color', value: e.target.value })}
                            className="w-full rounded border border-slate-400 bg-white text-[10px]"
                          >
                            {palette.map((color) => (
                              <option key={color.id} value={color.value}>{color.label}</option>
                            ))}
                          </select>
                          <button className="rounded bg-red-500 px-1 text-[10px] text-white" onClick={() => dispatch({ type: 'delete-task', taskId: task.id })}>x</button>
                        </div>
                      </div>
                    )}
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
                  className="h-[120px] resize-none border border-slate-400 bg-slate-50 p-2 text-xs"
                />
              ))}
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 z-0">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView={false} minZoom={1} maxZoom={1} zoomOnScroll={false} panOnDrag={false} panOnScroll={false} elementsSelectable={false} nodesDraggable={false}>
              <Background gap={16} size={0.4} color="#d9dee8" />
            </ReactFlow>
          </div>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold">JSON процесса</summary>
        <pre className="mt-3 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(state, null, 2)}</pre>
      </details>
    </div>
  );
}

export default App;
