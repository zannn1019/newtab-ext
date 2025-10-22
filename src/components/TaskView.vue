<template>
    <div class="task-view" data-stagger>
        <div class="task-header" data-stagger>
            <div class="header-content">
                <h1 class="task-title">Task Management</h1>
                <p class="task-subtitle">タスク管理</p>
            </div>
            <div class="header-stats">
                <div class="stat-item">
                    <span class="stat-value">{{ completedToday }}</span>
                    <span class="stat-label">Completed Today</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ tasks.filter(t => !t.completed).length }}</span>
                    <span class="stat-label">Active Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ streakDays }}</span>
                    <span class="stat-label">Day Streak</span>
                </div>
            </div>
        </div>

        <!-- Quick Add Section -->
        <div class="quick-add-section" data-stagger>
            <div class="quick-add-container">
                <input ref="quickAddInput" v-model="newTaskTitle" @keydown.enter="addTask" @focus="isAddFocused = true"
                    @blur="isAddFocused = false" class="quick-add-input" placeholder="What needs to be done?"
                    type="text" />
                <div class="quick-add-options" :class="{ 'options-visible': isAddFocused || newTaskTitle }">
                    <select v-model="newTaskPriority" class="priority-select">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <input v-model="newTaskDueDate" type="date" class="due-date-input" :min="today" />
                    <button @click="addTask" class="btn-add-task" :disabled="!newTaskTitle.trim()">
                        <Plus :size="20" :stroke-width="2" />
                        Add Task
                    </button>
                </div>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs" data-stagger>
            <button v-for="filter in filters" :key="filter.value" @click="currentFilter = filter.value"
                class="filter-tab" :class="{ 'active': currentFilter === filter.value }">
                <component :is="filter.icon" :size="18" :stroke-width="2" />
                {{ filter.label }}
                <span class="filter-count">{{ getFilterCount(filter.value) }}</span>
            </button>
        </div>

        <!-- Tasks List -->
        <div class="tasks-container" data-stagger>
            <TransitionGroup name="task" tag="div" class="tasks-list">
                <div v-for="task in filteredTasks" :key="task.id" class="task-item" :class="[
                        `priority-${task.priority}`,
                        { 'completed': task.completed, 'overdue': isOverdue(task) }
                    ]" @mouseenter="hoveredTask = task.id" @mouseleave="hoveredTask = null">
                    <!-- Checkbox -->
                    <div class="task-checkbox-wrapper">
                        <input type="checkbox" :id="`task-${task.id}`" v-model="task.completed"
                            @change="toggleTask(task)" class="task-checkbox" />
                        <label :for="`task-${task.id}`" class="checkbox-label">
                            <CheckCircle2 v-if="task.completed" :size="24" :stroke-width="2" />
                            <Circle v-else :size="24" :stroke-width="2" />
                        </label>
                    </div>

                    <!-- Task Content -->
                    <div class="task-content">
                        <div class="task-title-row">
                            <span class="task-title-text">{{ task.title }}</span>
                            <div class="task-badges">
                                <span v-if="task.dueDate" class="due-date-badge"
                                    :class="{ 'overdue': isOverdue(task) }">
                                    <Calendar :size="14" :stroke-width="2" />
                                    {{ formatDate(task.dueDate) }}
                                </span>
                                <span class="priority-badge" :class="`priority-${task.priority}`">
                                    {{ task.priority }}
                                </span>
                            </div>
                        </div>
                        <div v-if="task.completed" class="task-meta">
                            Completed {{ formatRelativeTime(task.completedAt) }}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="task-actions" :class="{ 'actions-visible': hoveredTask === task.id }">
                        <button @click="deleteTask(task)" class="btn-task-action btn-delete" title="Delete">
                            <Trash2 :size="18" :stroke-width="2" />
                        </button>
                    </div>

                    <!-- Priority Indicator Line -->
                    <div class="priority-indicator"></div>
                </div>
            </TransitionGroup>

            <!-- Empty State -->
            <div v-if="filteredTasks.length === 0" class="empty-state">
                <div class="empty-icon">
                    <CheckCircle2 :size="64" :stroke-width="1.5" />
                </div>
                <h3 class="empty-title">{{ getEmptyStateTitle() }}</h3>
                <p class="empty-message">{{ getEmptyStateMessage() }}</p>
            </div>
        </div>

        <!-- Archive Button -->
        <div v-if="tasks.filter(t => t.completed).length > 0" class="archive-section" data-stagger>
            <button @click="archiveCompleted" class="btn-archive">
                <Archive :size="18" :stroke-width="2" />
                Archive {{ tasks.filter(t => t.completed).length }} Completed Tasks
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus, Circle, CheckCircle2, Calendar, Trash2, Archive, ListTodo, Clock, CheckCheck, Flame } from 'lucide-vue-next'
import { useKinesisAlert } from '../composables/useKinesisAlert'
import gsap from 'gsap'

const { confirm, success: showSuccess, error: showError } = useKinesisAlert()

// State
const tasks = ref([])
const newTaskTitle = ref('')
const newTaskPriority = ref('medium')
const newTaskDueDate = ref('')
const currentFilter = ref('all')
const isAddFocused = ref(false)
const hoveredTask = ref(null)
const quickAddInput = ref(null)

// Computed
const today = computed(() => new Date().toISOString().split('T')[0])

const filters = [
    { value: 'all', label: 'All Tasks', icon: ListTodo },
    { value: 'active', label: 'Active', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCheck },
]

const filteredTasks = computed(() => {
    let filtered = tasks.value

    if (currentFilter.value === 'active') {
        filtered = filtered.filter(t => !t.completed)
    } else if (currentFilter.value === 'completed') {
        filtered = filtered.filter(t => t.completed)
    }

    // Sort: incomplete first, then by priority, then by due date
    return filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }

        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate)
        }
        return a.dueDate ? -1 : 1
    })
})

const completedToday = computed(() => {
    const today = new Date().toDateString()
    return tasks.value.filter(t => {
        if (!t.completed || !t.completedAt) return false
        return new Date(t.completedAt).toDateString() === today
    }).length
})

const streakDays = computed(() => {
    // Simple streak calculation - days with at least one completed task
    const dates = tasks.value
        .filter(t => t.completed && t.completedAt)
        .map(t => new Date(t.completedAt).toDateString())
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a))
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i])
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === streak) {
            streak++
        } else {
            break
        }
    }
    
    return streak
})

// Methods
const addTask = async () => {
    if (!newTaskTitle.value.trim()) return

    const task = {
        id: Date.now(),
        title: newTaskTitle.value.trim(),
        priority: newTaskPriority.value,
        dueDate: newTaskDueDate.value || null,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    }

    tasks.value.unshift(task)
    saveTasks()

    // Reset form
    newTaskTitle.value = ''
    newTaskPriority.value = 'medium'
    newTaskDueDate.value = ''

    // Animate the new task
    await nextTick()
    const newTaskEl = document.querySelector('.task-item')
    if (newTaskEl) {
        gsap.from(newTaskEl, {
            x: -50,
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: 'back.out(1.7)'
        })
    }

    await showSuccess('Task added successfully', 'Task Created', 'タスク作成完了')
}

const toggleTask = async (task) => {
    task.completedAt = task.completed ? new Date().toISOString() : null
    saveTasks()

    if (task.completed) {
        // Completion animation
        const taskEl = document.querySelector(`#task-${task.id}`).closest('.task-item')
        gsap.to(taskEl, {
            scale: 1.02,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        })

        await showSuccess(
            `"${task.title}" marked as complete!`,
            'Task Completed',
            'タスク完了'
        )
    }
}

const deleteTask = async (task) => {
    const confirmed = await confirm(
        `Delete "${task.title}"? This action cannot be undone.`,
        'Delete Task',
        'タスク削除'
    )

    if (confirmed) {
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index !== -1) {
            tasks.value.splice(index, 1)
            saveTasks()
            await showSuccess('Task deleted', 'Deleted', '削除完了')
        }
    }
}

const archiveCompleted = async () => {
    const completedCount = tasks.value.filter(t => t.completed).length
    
    const confirmed = await confirm(
        `Archive ${completedCount} completed tasks? They will be permanently removed.`,
        'Archive Tasks',
        'アーカイブ'
    )

    if (confirmed) {
        tasks.value = tasks.value.filter(t => !t.completed)
        saveTasks()
        await showSuccess(
            `${completedCount} tasks archived successfully`,
            'Archive Complete',
            'アーカイブ完了'
        )
    }
}

const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getFilterCount = (filter) => {
    if (filter === 'all') return tasks.value.length
    if (filter === 'active') return tasks.value.filter(t => !t.completed).length
    if (filter === 'completed') return tasks.value.filter(t => t.completed).length
    return 0
}

const getEmptyStateTitle = () => {
    if (currentFilter.value === 'completed') return 'No completed tasks yet'
    if (currentFilter.value === 'active') return 'All caught up!'
    return 'No tasks yet'
}

const getEmptyStateMessage = () => {
    if (currentFilter.value === 'completed') return 'Complete some tasks to see them here'
    if (currentFilter.value === 'active') return 'Take a break, you deserve it'
    return 'Add your first task to get started'
}

// Persistence
const saveTasks = () => {
    localStorage.setItem('kinesis-tasks', JSON.stringify(tasks.value))
}

const loadTasks = () => {
    const saved = localStorage.getItem('kinesis-tasks')
    if (saved) {
        try {
            tasks.value = JSON.parse(saved)
        } catch (e) {
            console.error('Failed to load tasks')
        }
    }
}

// Lifecycle
onMounted(() => {
    loadTasks()
    
    // Focus input after mount
    nextTick(() => {
        if (quickAddInput.value) {
            quickAddInput.value.focus()
        }
    })
})
</script>

<style scoped>
.task-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px var(--space-6) var(--space-8);
    min-height: 100vh;
    position: relative;
    z-index: 1;
}

/* Header */
.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border-color);
}

.header-content {
    flex: 1;
}

.task-title {
    font-size: 3rem;
    font-weight: 200;
    margin: 0 0 var(--space-2) 0;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.task-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    letter-spacing: 2px;
    margin: 0;
}

.header-stats {
    display: flex;
    gap: var(--space-6);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    min-width: 100px;
}

.stat-value {
    font-size: 2rem;
    font-weight: 300;
    color: var(--text-primary);
    margin-bottom: var(--space-1);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Quick Add */
.quick-add-section {
    margin-bottom: var(--space-6);
}

.quick-add-container {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    padding: var(--space-4);
    transition: all 0.3s ease;
}

.quick-add-container:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.quick-add-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1.1rem;
    color: var(--text-primary);
    padding: var(--space-2) 0;
    font-weight: 300;
}

.quick-add-input::placeholder {
    color: var(--text-muted);
}

.quick-add-options {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-3);
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
}

.quick-add-options.options-visible {
    opacity: 1;
    max-height: 100px;
}

.priority-select,
.due-date-input {
    padding: var(--space-2) var(--space-3);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.priority-select:hover,
.due-date-input:hover {
    border-color: var(--primary-color);
}

.btn-add-task {
    padding: var(--space-2) var(--space-4);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.2s ease;
}

.btn-add-task:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.btn-add-task:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Filter Tabs */
.filter-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    border-bottom: 1px solid var(--border-color);
}

.filter-tab {
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.2s ease;
    position: relative;
}

.filter-tab:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
}

.filter-tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.filter-tab.active .filter-count {
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary-color);
}

/* Tasks List */
.tasks-container {
    min-height: 400px;
}

.tasks-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.task-item {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.task-item:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-title-text {
    text-decoration: line-through;
    color: var(--text-secondary);
}

/* Priority Indicator */
.priority-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--border-color);
    transition: all 0.3s ease;
}

.task-item.priority-high .priority-indicator {
    background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.task-item.priority-medium .priority-indicator {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.task-item.priority-low .priority-indicator {
    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
}

/* Checkbox */
.task-checkbox-wrapper {
    position: relative;
}

.task-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.checkbox-label {
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.checkbox-label:hover {
    color: var(--primary-color);
    transform: scale(1.1);
}

.task-checkbox:checked + .checkbox-label {
    color: #22c55e;
}

/* Task Content */
.task-content {
    flex: 1;
    min-width: 0;
}

.task-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-1);
}

.task-title-text {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 400;
}

.task-badges {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
}

.due-date-badge,
.priority-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.due-date-badge {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.due-date-badge.overdue {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
}

.priority-badge.priority-high {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.priority-badge.priority-medium {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
}

.priority-badge.priority-low {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
}

.task-meta {
    font-size: 0.8rem;
    color: var(--text-muted);
}

/* Actions */
.task-actions {
    display: flex;
    gap: var(--space-2);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.2s ease;
}

.task-actions.actions-visible {
    opacity: 1;
    transform: translateX(0);
}

.btn-task-action {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-task-action:hover {
    transform: scale(1.1);
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.05);
}

.btn-delete:hover {
    border-color: #ef4444;
    color: #ef4444;
}

/* Transitions */
.task-enter-active,
.task-leave-active {
    transition: all 0.4s ease;
}

.task-enter-from {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
}

.task-leave-to {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
}

.task-move {
    transition: transform 0.4s ease;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-4);
}

.empty-icon {
    color: var(--text-muted);
    opacity: 0.3;
    margin-bottom: var(--space-4);
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
}

.empty-message {
    color: var(--text-muted);
    font-size: 0.95rem;
}

/* Archive */
.archive-section {
    margin-top: var(--space-6);
    text-align: center;
}

.btn-archive {
    padding: var(--space-3) var(--space-6);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-secondary);
    font-size: 0.95rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.2s ease;
}

.btn-archive:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
    .task-view {
        padding: 100px var(--space-4) var(--space-6);
    }

    .task-header {
        flex-direction: column;
        gap: var(--space-4);
    }

    .header-stats {
        width: 100%;
        justify-content: space-between;
    }

    .stat-item {
        min-width: auto;
        flex: 1;
    }

    .task-title {
        font-size: 2rem;
    }

    .filter-tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .task-item {
        flex-wrap: wrap;
    }

    .task-actions {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
