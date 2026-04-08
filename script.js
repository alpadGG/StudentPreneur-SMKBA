/**
 * STUDENTPRENEUR SMKBA - Core Script
 * Deskripsi: Mengelola pengambilan data produk dari Flask API dan 
 * menampilkannya secara dinamis ke antarmuka web.
 */

$(document).ready(function() {
    // Endpoint API yang dihosting di PythonAnywhere
    const apiUrl = 'https://alpad.pythonanywhere.com/api/products';

    /**
     * @function formatIDR
     * @description Mengonversi angka mentah menjadi format mata uang Rupiah.
     * Mendukung format single price maupun range (contoh: 5000-10000).
     */
    const formatIDR = (priceData) => {
        const formatter = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });

        // Cek jika data harga merupakan rentang (range)
        if (priceData.includes('-')) {
            const parts = priceData.split('-');
            return `${formatter.format(parts[0])} - ${formatter.format(parts[1])}`;
        }
        return formatter.format(priceData);
    };

    /**
     * @function loadProducts
     * @async
     * @description Mengambil data JSON dari API, menyusun struktur HTML kartu produk,
     * dan merendernya ke dalam container produk.
     */
    async function loadProducts() {
        try {
            // Proses pengambilan data (Fetching)
            const response = await fetch(apiUrl);
            const products = await response.json();
            let productHTML = '';

            // Looping data produk untuk membuat elemen kartu (Card)
           products.forEach((item) => {
               // Ambil gambar pertama untuk cover
               const coverFoto = (item.foto_list && item.foto_list.length > 0) 
                   ? item.foto_list[0] 
                   : 'https://via.placeholder.com/400x300?text=No+Image';
               const allFotos = item.foto_list ? item.foto_list.join('|') : coverFoto;

                const pesanWA = `Halo admin, saya tertarik dengan produk "${item.nama}". Apakah masih tersedia?`;
                const linkWA = `https://wa.me/${item.wa}?text=${encodeURIComponent(pesanWA)}`;
            
                productHTML += `
                    <div class="col-6 col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger d-flex flex-column" 
                            style="cursor: pointer; border-radius: 15px; overflow: hidden; background: #fff;"
                            data-nama="${item.nama}"
                            data-harga="${item.harga_raw}"
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
                                <button class="btn btn-primary btn-sm w-100 rounded-pill" style="font-size: 12px;">Lihat Detail</button>
                            </div>
                        </div>
                    </div>`;
            });

            // Update DOM: Hapus spinner loading dan tampilkan produk dengan efek Fade In
            $('.loading-spinner').remove();
            $('#product-container').hide().html(productHTML).fadeIn();

        } catch (error) {
            // Penanganan error jika API gagal diakses
            console.error('Error:', error);
            $('#product-container').html('<div class="col-12 text-center text-danger">Gagal memuat katalog produk.</div>');
        }
    }

    /**
     * @event ModalTrigger
     * @description Menangkap klik pada kartu produk untuk memindahkan data atribut 
     * ke dalam elemen-elemen di dalam Modal Detail.
     */
    $(document).on('click', '.product-card-trigger', function() {
        const d = $(this).data();
        
        // Ambil semua foto dari atribut data-foto-all
        const fotoArray = d.fotoAll ? d.fotoAll.split('|') : [];
    
        // Mapping data teks
        $('#modal-title').text(d.nama);
        $('#modal-price').text(formatIDR(d.harga.toString()));
        $('#modal-category').text(d.kategori);
        $('#modal-wa-btn').attr('href', d.wa);
        $('#modal-seller').html(`<i class="bi bi-person-fill me-1"></i> Penjual: <strong>${d.penjual}</strong>`);
        $('#modal-desc').text(d.desc || `Produk berkualitas dari StudentPreneur SMKBA.`);
    
        // --- LOGIKA CAROUSEL DINAMIS ---
        let indicatorsHTML = '';
        let itemsHTML = '';
    
        fotoArray.forEach((url, index) => {
            const activeClass = index === 0 ? 'active' : '';
            indicatorsHTML += `
                <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="${index}" class="${activeClass}"></button>`;
            itemsHTML += `
                <div class="carousel-item ${activeClass}">
                    <img src="${url}" class="d-block w-100" style="aspect-ratio: 4/3; object-fit: cover; border-radius: 10px;">
                </div>`;
        });
    
        const fullCarousel = `
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-indicators">${indicatorsHTML}</div>
                <div class="carousel-inner">${itemsHTML}</div>
                <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>
            </div>`;
    
        // Masukkan carousel ke dalam modal body (pastikan id ini ada di HTML)
        $('#modal-media-container').html(fullCarousel);
    
        const myModal = new bootstrap.Modal(document.getElementById('productModal'));
        myModal.show();
    });
    /**
     * @event FilterCategory
     * @description Menyaring tampilan produk berdasarkan kategori yang dipilih user.
     */
    $(document).on('click', '.filter-btn', function() {
        // Toggle class aktif pada tombol filter
        $('.filter-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');
        
        const filter = $(this).data('filter');
        
        // Logika Show/Hide elemen berdasarkan atribut data-category
        if(filter === 'all') {
            $('.product-item').show();
        } else {
            $('.product-item').hide();
            $(`.product-item[data-category="${filter}"]`).show();
        }
    });

    // Inisialisasi awal saat halaman dimuat
    loadProducts();
});
