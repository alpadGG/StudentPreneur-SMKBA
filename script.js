$(document).ready(function() {
    const apiUrl = 'https://alpad.pythonanywhere.com/api/products';

    const formatIDR = (priceData) => {
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        const priceStr = priceData.toString();
        if (priceStr.includes('-')) {
            const parts = priceStr.split('-');
            return `${formatter.format(parts[0])} - ${formatter.format(parts[1])}`;
        }
        return formatter.format(priceStr);
    };

    async function loadProducts() {
        try {
            const response = await fetch(apiUrl);
            const products = await response.json();
            let productHTML = '';

            products.forEach((item) => {
                // Pastikan foto_list ada, jika tidak pakai placeholder
                const coverFoto = item.foto_list && item.foto_list.length > 0 ? item.foto_list[0] : 'https://via.placeholder.com/400x300';
                const allFotos = item.foto_list ? item.foto_list.join('|') : coverFoto;
                
                const pesanWA = `Halo admin, saya tertarik dengan produk "${item.nama}". Apakah masih tersedia?`;
                const linkWA = `https://wa.me/${item.wa}?text=${encodeURIComponent(pesanWA)}`;
            
                productHTML += `
                    <div class="col-6 col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger d-flex flex-column" 
                            style="cursor: pointer; border-radius: 15px; overflow: hidden; background: #fff;"
                            data-nama="${item.nama}"
                            data-harga="${item.harga_raw}"
                            data-foto-cover="${coverFoto}"
                            data-foto-all="${allFotos}"
                            data-wa="${linkWA}"
                            data-kategori="${item.kategori}"
                            data-desc="${item.deskripsi}"
                            data-penjual="${item.penjual}">
                            
                            <div class="product-img-wrapper" style="aspect-ratio: 1 / 1; width: 100%; overflow: hidden;">
                                <img src="${coverFoto}" class="w-100 h-100" style="object-fit: cover;" alt="${item.nama}">
                            </div>
                
                            <div class="p-3 d-flex flex-column flex-grow-1 text-center">
                                <span class="badge bg-light text-primary mb-2 border align-self-center" style="font-size: 10px;">
                                    ${item.kategori}
                                </span>
                                <h6 class="fw-bold mb-1 text-truncate" style="font-size: 14px;">${item.nama}</h6>
                                <p class="text-primary fw-bold mb-3 small mt-auto">${formatIDR(item.harga_raw)}</p>
                                <button class="btn btn-primary btn-sm w-100 rounded-pill" style="font-size: 12px;">Detail</button>
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

    // EVENT MODAL (Hanya Satu Handler)
    $(document).on('click', '.product-card-trigger', function() {
        const d = $(this).data();

        // 1. Set Data Dasar
        $('#modal-title').text(d.nama);
        $('#modal-price').text(formatIDR(d.harga));
        $('#modal-img').attr('src', d.fotoCover);
        $('#modal-category').text(d.kategori);
        $('#modal-wa-btn').attr('href', d.wa);
        $('#modal-seller').html(`<i class="bi bi-person-fill me-1"></i> Penjual: <strong>${d.penjual}</strong>`);
        
        const finalDesc = d.desc ? d.desc : `Dapatkan produk ${d.nama} berkualitas tinggi hanya di StudentPreneur SMKBA.`;
        $('#modal-desc').text(finalDesc);

        // 2. Logika Galeri
        if (d.fotoAll) {
            const fotoArray = d.fotoAll.split('|');
            let galleryHTML = '';
            
            fotoArray.forEach((url, index) => {
                galleryHTML += `
                    <div class="col-3 mb-2">
                        <img src="${url}" 
                             class="img-thumbnail thumb-gallery ${index === 0 ? 'border-primary' : ''}" 
                             style="height: 60px; width: 100%; object-fit: cover; cursor: pointer;"
                             onclick="$('#modal-img').attr('src', '${url}'); $('.thumb-gallery').removeClass('border-primary'); $(this).addClass('border-primary'); event.stopPropagation();">
                    </div>
                `;
            });

            if ($('#modal-gallery-container').length === 0) {
                $('#modal-img').after('<div id="modal-gallery-container" class="row gx-2 mt-2"></div>');
            }
            $('#modal-gallery-container').html(galleryHTML);
        }

        const myModal = new bootstrap.Modal(document.getElementById('productModal'));
        myModal.show();
    });

    // Filter Kategori
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
