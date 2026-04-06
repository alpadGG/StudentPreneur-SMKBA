$(document).ready(function() {
    const apiUrl = 'https://www.google.com/search?q=alpad.pythonanywhere.com';

    /**
     * Memformat angka/rentang angka menjadi Rupiah yang cantik
     */
    const formatIDR = (priceData) => {
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });

        if (priceData.includes('-')) {
            const parts = priceData.split('-');
            return `${formatter.format(parts[0])} - ${formatter.format(parts[1])}`;
        }
        return formatter.format(priceData);
    };

    async function loadProducts() {
        try {
            const response = await fetch(apiUrl);
            const products = await response.json();
            let productHTML = '';

            products.forEach((item) => {
                const pesanWA = `Halo admin, saya tertarik dengan produk "${item.nama}". Apakah masih tersedia?`;
                const linkWA = `https://wa.me/${item.wa}?text=${encodeURIComponent(pesanWA)}`;

                productHTML += `
                    <div class="col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger" 
                             style="cursor: pointer; transition: transform 0.2s;"
                             data-nama="${item.nama}"
                             data-harga="${item.harga_raw}"
                             data-foto="${item.foto}"
                             data-wa="${linkWA}"
                             data-kategori="${item.kategori}"
                             data-desc="${item.deskripsi}">
                            <div class="product-img-wrapper" style="height: 200px; overflow: hidden; border-radius: 8px 8px 0 0;">
                                <img src="${item.foto}" class="w-100 h-100" style="object-fit: cover;" alt="${item.nama}">
                            </div>
                            <div class="p-3 text-center">
                                <span class="badge bg-light text-secondary mb-2 border">${item.kategori}</span>
                                <h6 class="fw-bold mb-1 text-truncate">${item.nama}</h6>
                                <p class="text-primary fw-bold mb-3 small">${formatIDR(item.harga_raw)}</p>
                                <button class="btn btn-primary btn-sm w-100 rounded-pill">Lihat Detail</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            $('.loading-spinner').remove();
            $('#product-container').hide().html(productHTML).fadeIn();

        } catch (error) {
            console.error('Error:', error);
            $('#product-container').html('<div class="col-12 text-center text-danger">Gagal memuat katalog produk.</div>');
        }
    }

    // --- LOGIKA MODAL ---
    $(document).on('click', '.product-card-trigger', function() {
        const d = $(this).data();

        $('#modal-title').text(d.nama);
        $('#modal-price').text(formatIDR(d.harga.toString()));
        $('#modal-img').attr('src', d.foto);
        $('#modal-category').text(d.kategori);
        $('#modal-wa-btn').attr('href', d.wa);
        
        // Gunakan deskripsi dari spreadsheet jika ada, jika tidak gunakan template
        const finalDesc = d.desc ? d.desc : `Dapatkan produk ${d.nama} berkualitas tinggi hanya di StudentPreneur SMKBA. Hubungi kami untuk informasi lebih lanjut.`;
        $('#modal-desc').text(finalDesc);

        const myModal = new bootstrap.Modal(document.getElementById('productModal'));
        myModal.show();
    });

    // --- LOGIKA FILTER ---
    $(document).on('click', '.filter-btn', function() {
        $('.filter-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');
        
        const filter = $(this).data('filter');
        if(filter === 'all') {
            $('.product-item').show();
        } else {
            $('.product-item').hide();
            $(`.product-item[data-category="${filter}"]`).show();
        }
    });

    loadProducts();
});
