<template>
    <div class="bookmarks-view">
        <!-- Japanese decoration -->
        <div class="japanese-label">お気に入り</div>

        <div class="bookmarks-container">
            <!-- Header -->
            <div class="bookmarks-header">
                <h2 class="bookmarks-title">Quick Links</h2>
                <p class="bookmarks-subtitle">ブックマーク</p>
            </div>

            <!-- Bookmarks Grid -->
            <div class="bookmarks-grid">
                <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id" class="bookmark-card"
                    :style="{ '--card-index': index }" @click="openBookmark(bookmark)">
                    <div class="bookmark-icon">{{ bookmark.icon }}</div>
                    <div class="bookmark-info">
                        <div class="bookmark-name">{{ bookmark.name }}</div>
                        <div class="bookmark-url">{{ getDisplayUrl(bookmark.url) }}</div>
                    </div>
                    <button class="bookmark-edit" @click.stop="editBookmark(bookmark)">✎</button>
                    <button class="bookmark-delete" @click.stop="deleteBookmark(bookmark.id)">×</button>
                </div>

                <!-- Add Bookmark Card -->
                <div class="bookmark-card add-card" @click="showAddModal = true">
                    <div class="add-icon">+</div>
                    <div class="add-text">Add Bookmark</div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Bookmark Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <h3 class="modal-title">{{ editingBookmark ? 'Edit' : 'Add' }} Bookmark</h3>
                <p class="modal-subtitle">{{ editingBookmark ? '編集' : '追加' }}</p>

                <form @submit.prevent="saveBookmark" class="bookmark-form">
                    <div class="form-group">
                        <label>Icon (Emoji)</label>
                        <input v-model="formData.icon" type="text" placeholder="🔖" maxlength="2" required />
                    </div>

                    <div class="form-group">
                        <label>Name</label>
                        <input v-model="formData.name" type="text" placeholder="GitHub" required />
                    </div>

                    <div class="form-group">
                        <label>URL</label>
                        <input v-model="formData.url" type="url" placeholder="https://github.com" required />
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
                        <button type="submit" class="btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Ambient grid lines -->
        <div class="bookmarks-grid-bg">
            <div class="grid-line" v-for="i in 8" :key="`line-${i}`"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const bookmarks = ref([])
const showAddModal = ref(false)
const editingBookmark = ref(null)
const formData = ref({
    icon: '',
    name: '',
    url: ''
})

let nextId = 1

// Default bookmarks
const defaultBookmarks = [
    { id: 1, icon: '📧', name: 'Gmail', url: 'https://mail.google.com' },
    { id: 2, icon: '🐙', name: 'GitHub', url: 'https://github.com' },
    { id: 3, icon: '📺', name: 'YouTube', url: 'https://youtube.com' },
    { id: 4, icon: '🐦', name: 'Twitter', url: 'https://twitter.com' },
]

const loadBookmarks = () => {
    const saved = localStorage.getItem('zan-bookmarks')
    if (saved) {
        try {
            bookmarks.value = JSON.parse(saved)
            nextId = Math.max(...bookmarks.value.map(b => b.id), 0) + 1
        } catch (e) {
            bookmarks.value = [...defaultBookmarks]
            nextId = 5
        }
    } else {
        bookmarks.value = [...defaultBookmarks]
        nextId = 5
        saveBookmarks()
    }
}

const saveBookmarks = () => {
    localStorage.setItem('zan-bookmarks', JSON.stringify(bookmarks.value))
}

const openBookmark = (bookmark) => {
    window.open(bookmark.url, '_blank')
}

const editBookmark = (bookmark) => {
    editingBookmark.value = bookmark
    formData.value = {
        icon: bookmark.icon,
        name: bookmark.name,
        url: bookmark.url
    }
    showAddModal.value = true
}

const deleteBookmark = (id) => {
    if (confirm('Delete this bookmark?')) {
        bookmarks.value = bookmarks.value.filter(b => b.id !== id)
        saveBookmarks()
    }
}

const saveBookmark = () => {
    if (editingBookmark.value) {
        // Edit existing
        const index = bookmarks.value.findIndex(b => b.id === editingBookmark.value.id)
        bookmarks.value[index] = {
            ...editingBookmark.value,
            ...formData.value
        }
    } else {
        // Add new
        bookmarks.value.push({
            id: nextId++,
            ...formData.value
        })
    }
    saveBookmarks()
    closeModal()
}

const closeModal = () => {
    showAddModal.value = false
    editingBookmark.value = null
    formData.value = { icon: '', name: '', url: '' }
}

const getDisplayUrl = (url) => {
    try {
        const urlObj = new URL(url)
        return urlObj.hostname.replace('www.', '')
    } catch (e) {
        return url
    }
}

onMounted(() => {
    loadBookmarks()
})
</script>

<style scoped>
.bookmarks-view {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: transparent;
    padding-top: 120px;
    padding-bottom: var(--space-16);
}

.japanese-label {
    position: absolute;
    top: calc(120px + var(--space-8));
    left: var(--space-8);
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    z-index: 1;
}

.bookmarks-container {
    max-width: 1200px;
    width: 90%;
    z-index: 2;
    position: relative;
}

.bookmarks-header {
    text-align: center;
    margin-bottom: var(--space-12);
}

.bookmarks-title {
    font-size: 2.5rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.bookmarks-subtitle {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0;
}

/* Bookmarks Grid */
.bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-6);
}

.bookmark-card {
    position: relative;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    cursor: pointer;
    transition: all 0.3s var(--ease);
}

.bookmark-card:hover {
    background: var(--accent-dim);
    border-color: var(--accent);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.bookmark-card:hover .bookmark-edit,
.bookmark-card:hover .bookmark-delete {
    opacity: 1;
}

.bookmark-icon {
    font-size: 3rem;
    margin-bottom: var(--space-2);
}

.bookmark-info {
    text-align: center;
    width: 100%;
}

.bookmark-name {
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: var(--space-1);
}

.bookmark-url {
    font-size: 0.75rem;
    font-weight: 300;
    color: var(--text-muted);
}

.bookmark-edit,
.bookmark-delete {
    position: absolute;
    top: var(--space-2);
    width: 28px;
    height: 28px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s var(--ease);
    font-size: 1rem;
    color: var(--text-secondary);
}

.bookmark-edit {
    right: calc(var(--space-2) + 36px);
}

.bookmark-edit:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.bookmark-delete {
    right: var(--space-2);
    font-size: 1.5rem;
}

.bookmark-delete:hover {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
}

/* Add Card */
.add-card {
    border: 2px dashed var(--border-color);
    background: transparent;
    min-height: 160px;
}

.add-card:hover {
    border-color: var(--accent);
    background: var(--accent-dim);
}

.add-icon {
    font-size: 3rem;
    font-weight: 200;
    color: var(--text-muted);
    transition: all 0.3s var(--ease);
}

.add-card:hover .add-icon {
    color: var(--accent);
    transform: rotate(90deg);
}

.add-text {
    font-size: 0.875rem;
    font-weight: 300;
    color: var(--text-muted);
    letter-spacing: 0.05em;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(45, 45, 45, 0.6);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: var(--space-8);
    max-width: 500px;
    width: 90%;
    animation: slideUp 0.4s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-title {
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
}

.modal-subtitle {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    margin: 0 0 var(--space-8);
}

.bookmark-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
}

.form-group input {
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 1rem;
    color: var(--text-primary);
    transition: all 0.3s var(--ease);
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent);
    background: var(--bg-primary);
}

.form-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    margin-top: var(--space-4);
}

.btn-primary,
.btn-secondary {
    padding: var(--space-3) var(--space-6);
    border-radius: 4px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.3s var(--ease);
    border: none;
}

.btn-primary {
    background: var(--accent);
    color: white;
}

.btn-primary:hover {
    background: var(--text-primary);
    transform: translateY(-2px);
}

.btn-secondary {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-secondary:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

/* Background Grid */
.bookmarks-grid-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    z-index: 0;
    opacity: 0.08;
}

.grid-line {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom,
            transparent 0%,
            var(--accent) 20%,
            var(--accent) 80%,
            transparent 100%);
}

/* Responsive */
@media (max-width: 768px) {
    .bookmarks-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-4);
    }

    .bookmark-card {
        padding: var(--space-4);
    }

    .bookmark-icon {
        font-size: 2.5rem;
    }

    .bookmark-name {
        font-size: 0.875rem;
    }

    .bookmark-edit,
    .bookmark-delete {
        opacity: 1;
    }
}
</style>
