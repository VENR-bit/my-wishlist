// ===== Supabase Client Setup =====
const { createClient } = supabase;
let db;

function initSupabase() {
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ===== Load & Render Wishlist =====
async function loadWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-state');

    try {
        const { data, error } = await db
            .from('wishlist_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        window._wishlistData = data;
        renderCards(data);
    } catch (err) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#ff3b30;">
            Failed to load wishlist. Check your Supabase config.</p>`;
        console.error(err);
    }
}

function renderCards(items) {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-state');

    if (items.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = items.map(item => `
        <div class="card">
            ${item.image_url
                ? `<img class="card-image" src="${item.image_url}" alt="${escapeHtml(item.name)}" loading="lazy">`
                : `<div class="card-image placeholder">&#128230;</div>`
            }
            <div class="card-body">
                <h3 class="card-title">${escapeHtml(item.name)}</h3>
                <p class="card-description">${escapeHtml(item.description || '')}</p>
                <div class="card-footer">
                    <span class="card-price">LKR ${Number(item.price).toFixed(2)}</span>
                    <span class="card-qty">Qty: ${item.quantity}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Search & Sort =====
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (!searchInput || !sortSelect) return;

    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
    let items = [...(window._wishlistData || [])];
    const query = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortSelect').value;

    // Filter
    if (query) {
        items = items.filter(i =>
            i.name.toLowerCase().includes(query) ||
            (i.description || '').toLowerCase().includes(query)
        );
    }

    // Sort
    switch (sort) {
        case 'price-low':
            items.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            items.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            items.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    renderCards(items);
}

// ===== Utility =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    loadWishlist();
    setupFilters();
});
