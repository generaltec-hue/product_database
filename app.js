class ProductDatabase {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.products = data.products;
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '';

        this.filteredProducts.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.model}" class="product-image" onerror="this.src='assets/placeholder.jpg'">
            <div class="product-category">${product.category}</div>
            <div class="product-model">${product.model}</div>
            <div class="product-id">${product.id}</div>
            <div class="product-specs-preview">
                <strong>Capacity:</strong> ${product.specifications.capacity}<br>
                <strong>Weight:</strong> ${product.specifications.weight}
            </div>
        `;

        card.addEventListener('click', () => this.showProductDetail(product));
        return card;
    }

    showProductDetail(product) {
        const detailSection = document.getElementById('productDetail');
        const grid = document.getElementById('productGrid');
        
        grid.style.display = 'none';
        detailSection.style.display = 'block';
        
        detailSection.innerHTML = this.createProductDetailHTML(product);
    }

    createProductDetailHTML(product) {
        return `
            <button onclick="this.closest('.product-detail').style.display='none'; document.getElementById('productGrid').style.display='grid'">← Back</button>
            <h2>${product.model}</h2>
            <div class="product-id">${product.id}</div>
            
            <div class="image-gallery">
                ${product.images.map(img => `<img src="${img}" alt="${product.model}" class="detail-image">`).join('')}
            </div>
            
            <div class="specifications">
                <h3>Technical Specifications</h3>
                <table class="specs-table">
                    ${Object.entries(product.specifications).map(([key, value]) => `
                        <tr>
                            <td>${this.formatKey(key)}</td>
                            <td>${value}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <div class="features">
                <h3>Features</h3>
                <ul>
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="actions">
                <button onclick="shareOnWhatsApp('${product.id}')" class="whatsapp-btn">Share via WhatsApp</button>
                <button onclick="generatePDF('${product.id}')" class="pdf-btn">Download PDF</button>
            </div>
        `;
    }

    formatKey(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');

        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e.target.value));
    }

    handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.model.toLowerCase().includes(term) ||
            product.id.toLowerCase().includes(term) ||
            JSON.stringify(product.specifications).toLowerCase().includes(term)
        );
        this.renderProducts();
    }

    handleCategoryFilter(category) {
        if (!category) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        this.renderProducts();
    }
}

// WhatsApp Sharing Function
function shareOnWhatsApp(productId) {
    const product = app.products.find(p => p.id === productId);
    if (product) {
        const text = `Check out ${product.model} (${product.id}) from GeneralTec:\n\n${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ProductDatabase();
});
