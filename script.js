const STORAGE_KEY = 'todo-list-items'

const RAINBOW_PALETTE = [
  { name: 'red', border: 'border-l-red-500', bg: 'bg-red-50', checkbox: 'accent-red-500', badge: 'bg-red-100 text-red-700' },
  { name: 'orange', border: 'border-l-orange-500', bg: 'bg-orange-50', checkbox: 'accent-orange-500', badge: 'bg-orange-100 text-orange-700' },
  { name: 'amber', border: 'border-l-amber-500', bg: 'bg-amber-50', checkbox: 'accent-amber-500', badge: 'bg-amber-100 text-amber-700' },
  { name: 'yellow', border: 'border-l-yellow-500', bg: 'bg-yellow-50', checkbox: 'accent-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  { name: 'lime', border: 'border-l-lime-500', bg: 'bg-lime-50', checkbox: 'accent-lime-500', badge: 'bg-lime-100 text-lime-700' },
  { name: 'green', border: 'border-l-green-500', bg: 'bg-green-50', checkbox: 'accent-green-500', badge: 'bg-green-100 text-green-700' },
  { name: 'emerald', border: 'border-l-emerald-500', bg: 'bg-emerald-50', checkbox: 'accent-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  { name: 'teal', border: 'border-l-teal-500', bg: 'bg-teal-50', checkbox: 'accent-teal-500', badge: 'bg-teal-100 text-teal-700' },
  { name: 'cyan', border: 'border-l-cyan-500', bg: 'bg-cyan-50', checkbox: 'accent-cyan-500', badge: 'bg-cyan-100 text-cyan-700' },
  { name: 'sky', border: 'border-l-sky-500', bg: 'bg-sky-50', checkbox: 'accent-sky-500', badge: 'bg-sky-100 text-sky-700' },
  { name: 'blue', border: 'border-l-blue-500', bg: 'bg-blue-50', checkbox: 'accent-blue-500', badge: 'bg-blue-100 text-blue-700' },
  { name: 'indigo', border: 'border-l-indigo-500', bg: 'bg-indigo-50', checkbox: 'accent-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  { name: 'violet', border: 'border-l-violet-500', bg: 'bg-violet-50', checkbox: 'accent-violet-500', badge: 'bg-violet-100 text-violet-700' },
  { name: 'purple', border: 'border-l-purple-500', bg: 'bg-purple-50', checkbox: 'accent-purple-500', badge: 'bg-purple-100 text-purple-700' },
  { name: 'fuchsia', border: 'border-l-fuchsia-500', bg: 'bg-fuchsia-50', checkbox: 'accent-fuchsia-500', badge: 'bg-fuchsia-100 text-fuchsia-700' },
  { name: 'pink', border: 'border-l-pink-500', bg: 'bg-pink-50', checkbox: 'accent-pink-500', badge: 'bg-pink-100 text-pink-700' },
  { name: 'rose', border: 'border-l-rose-500', bg: 'bg-rose-50', checkbox: 'accent-rose-500', badge: 'bg-rose-100 text-rose-700' },
]

const DEFAULT_ITEMS = [
  { id: crypto.randomUUID(), task: 'Buy Milk', complete: false },
  { id: crypto.randomUUID(), task: 'Feed Cat', complete: true },
  { id: crypto.randomUUID(), task: 'Clean Room', complete: false },
  { id: crypto.randomUUID(), task: 'Make Dinner', complete: false },
]

/**
 * createElement
 * @param {string} type - element type
 * @param {object} props - attributes, properties, and event listeners
 * @param {...(Element|string)} children - child nodes
 * @returns {Element}
 */
function createElement (type, props = {}, ...children) {
  const $el = document.createElement(type)

  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      $el.className = value
    } else if (key === 'dataset') {
      Object.assign($el.dataset, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      $el.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key in $el) {
      $el[key] = value
    } else {
      $el.setAttribute(key, value)
    }
  }

  $el.append(...children)
  return $el
}

const $app = document.querySelector('#app')
const $taskCount = document.querySelector('#task-count')

let items = loadItems()
let filter = 'all'
let editingId = null

function loadItems () {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_ITEMS.map(item => ({ ...item, id: crypto.randomUUID() }))
}

function saveItems () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function getFilteredItems () {
  if (filter === 'active') {
    return items.filter(item => !item.complete)
  }
  if (filter === 'completed') {
    return items.filter(item => item.complete)
  }
  return items
}

function getRainbowColor (index) {
  return RAINBOW_PALETTE[index % RAINBOW_PALETTE.length]
}

function addTask (taskText) {
  const trimmed = taskText.trim()
  if (!trimmed) return

  items.unshift({
    id: crypto.randomUUID(),
    task: trimmed,
    complete: false,
  })

  saveItems()
  render()
}

function toggleTask (id) {
  const item = items.find(entry => entry.id === id)
  if (!item) return

  item.complete = !item.complete
  saveItems()
  render()
}

function deleteTask (id) {
  items = items.filter(entry => entry.id !== id)
  if (editingId === id) editingId = null
  saveItems()
  render()
}

function startEditing (id) {
  editingId = id
  render()

  const $input = document.querySelector(`[data-edit-id="${id}"]`)
  if ($input) {
    $input.focus()
    $input.select()
  }
}

function saveEdit (id, newText) {
  const trimmed = newText.trim()
  const item = items.find(entry => entry.id === id)

  if (!item) {
    editingId = null
    render()
    return
  }

  if (!trimmed) {
    deleteTask(id)
    return
  }

  item.task = trimmed
  editingId = null
  saveItems()
  render()
}

function clearCompleted () {
  items = items.filter(item => !item.complete)
  saveItems()
  render()
}

function setFilter (nextFilter) {
  filter = nextFilter
  render()
}

function createFilterButton (label, value) {
  const isActive = filter === value
  return createElement(
    'button',
    {
      type: 'button',
      className: isActive
        ? 'rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white shadow-sm'
        : 'rounded-full px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100',
      onclick: () => setFilter(value),
    },
    label
  )
}

function createTaskItem (item, index) {
  const color = getRainbowColor(index)
  const isEditing = editingId === item.id

  if (isEditing) {
    return createElement(
      'li',
      {
        className: `flex items-center gap-3 border-b border-slate-100 border-l-4 px-4 py-3 ${color.border} ${color.bg}`,
        dataset: { id: item.id },
      },
      createElement('input', {
        type: 'text',
        value: item.task,
        className: 'flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200',
        dataset: { editId: item.id },
        onkeydown: (event) => {
          if (event.key === 'Enter') saveEdit(item.id, event.target.value)
          if (event.key === 'Escape') {
            editingId = null
            render()
          }
        },
        onblur: (event) => saveEdit(item.id, event.target.value),
      })
    )
  }

  return createElement(
    'li',
    {
      className: `group flex items-center gap-3 border-b border-slate-100 border-l-4 px-4 py-3 transition hover:brightness-[0.98] ${color.border} ${color.bg}`,
      dataset: { id: item.id },
    },
    createElement('input', {
      type: 'checkbox',
      checked: item.complete,
      className: `h-5 w-5 shrink-0 cursor-pointer rounded ${color.checkbox}`,
      onchange: () => toggleTask(item.id),
    }),
    createElement(
      'label',
      {
        className: item.complete
          ? 'flex-1 cursor-pointer text-sm text-slate-400 line-through'
          : 'flex-1 cursor-pointer text-sm text-slate-800',
        onclick: () => toggleTask(item.id),
      },
      item.task
    ),
    createElement(
      'span',
      { className: `hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline ${color.badge}` },
      color.name
    ),
    createElement(
      'button',
      {
        type: 'button',
        title: 'Edit task',
        className: 'rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-blue-500 group-hover:opacity-100',
        onclick: () => startEditing(item.id),
      },
      createElement('span', { className: 'sr-only' }, 'Edit'),
      '✏️'
    ),
    createElement(
      'button',
      {
        type: 'button',
        title: 'Delete task',
        className: 'rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-white hover:text-rose-500 group-hover:opacity-100',
        onclick: () => deleteTask(item.id),
      },
      createElement('span', { className: 'sr-only' }, 'Delete'),
      '🗑️'
    )
  )
}

function render () {
  const filteredItems = getFilteredItems()
  const activeCount = items.filter(item => !item.complete).length
  const completedCount = items.length - activeCount

  $taskCount.textContent = `${activeCount} active · ${items.length} total`

  const $form = createElement(
    'form',
    {
      className: 'flex gap-2 border-b border-slate-100 p-4',
      onsubmit: (event) => {
        event.preventDefault()
        const $input = event.target.querySelector('input[type="text"]')
        addTask($input.value)
        $input.value = ''
      },
    },
    createElement('input', {
      type: 'text',
      placeholder: 'What needs to be done?',
      className: 'flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200',
      autocomplete: 'off',
      required: true,
    }),
    createElement(
      'button',
      {
        type: 'submit',
        className: 'rainbow-bar shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95',
      },
      'Add'
    )
  )

  const $filters = createElement(
    'div',
    { className: 'flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3' },
    createElement(
      'div',
      { className: 'flex flex-wrap gap-1' },
      createFilterButton('All', 'all'),
      createFilterButton('Active', 'active'),
      createFilterButton('Completed', 'completed')
    ),
    completedCount > 0
      ? createElement(
          'button',
          {
            type: 'button',
            className: 'text-xs font-medium text-rose-500 transition hover:text-rose-600',
            onclick: clearCompleted,
          },
          `Clear completed (${completedCount})`
        )
      : createElement('span', { className: 'text-xs text-slate-400' }, 'No completed tasks')
  )

  const $list = createElement(
    'ul',
    { className: 'divide-y divide-slate-50' },
    ...filteredItems.map((item, index) => {
      const originalIndex = items.findIndex(entry => entry.id === item.id)
      return createTaskItem(item, originalIndex)
    })
  )

  const $empty = filteredItems.length === 0
    ? createElement(
        'div',
        { className: 'px-4 py-12 text-center' },
        createElement('p', { className: 'text-4xl' }, '🌈'),
        createElement(
          'p',
          { className: 'mt-2 text-sm font-medium text-slate-600' },
          filter === 'completed'
            ? 'No completed tasks yet'
            : filter === 'active'
              ? 'All caught up — no active tasks!'
              : 'Your list is empty. Add a task above.'
        )
      )
    : null

  $app.replaceChildren(
    createElement('div', { className: 'rainbow-bar h-1' }),
    $form,
    $filters,
    $list,
    $empty
  )
}

render()
