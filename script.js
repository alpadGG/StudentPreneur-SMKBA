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
                // Setup integrasi WhatsApp dengan pesan otomatis
                const pesanWA = `Halo admin, saya tertarik dengan produk "${item.nama}". Apakah masih tersedia?`;
                const linkWA = `https://wa.me/${item.wa}?text=${encodeURIComponent(pesanWA)}`;

                // Template String untuk Kartu Produk
                productHTML += `
                    <div class="col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger" 
                            style="cursor: pointer; transition: transform 0.2s;"
                            data-nama="${item.nama}"
                            data-harga="${item.harga_raw}"
                            data-foto="${item.foto}"
                            data-wa="${linkWA}"
                            data-kategori="${item.kategori}"
                            data-desc="${item.deskripsi}"
                            data-penjual="${item.penjual}"> 
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
        const fotoArray = d.fotoAll.split('|');
    
        // 1. Data Dasar Modal
        $('#modal-title').text(d.nama);
        $('#modal-price').text(formatIDR(d.harga));
        $('#modal-category').text(d.kategori);
        $('#modal-wa-btn').attr('href', d.wa);
        $('#modal-seller').html(`<i class="bi bi-person-fill me-1"></i> Penjual: <strong>${d.penjual}</strong>`);
        $('#modal-desc').text(d.desc || `Produk unggulan dari ${d.penjual} SMKBA.`);
    
        // 2. Logika Carousel Dinamis
        let carouselIndicators = '';
        let carouselItems = '';
    
        fotoArray.forEach((url, index) => {
            // Slide pertama harus punya class 'active'
            const activeClass = index === 0 ? 'active' : '';
            
            // Buat Indicator (titik-titik di bawah)
            carouselIndicators += `
                <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="${index}" 
                    class="${activeClass}" aria-current="${index === 0}" aria-label="Slide ${index + 1}"></button>`;
    
            // Buat Item Gambar
            carouselItems += `
                <div class="carousel-item ${activeClass}">
                    <div style="aspect-ratio: 4/3; background: #f8f9fa; border-radius: 10px; overflow: hidden;">
                        <img src="${url}" class="d-block w-100 h-100" style="object-fit: cover;" alt="Foto ${index + 1}">
                    </div>
                </div>`;
        });
    
        // Susun Struktur Full Carousel
        const fullCarouselHTML = `
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-indicators">
                    ${carouselIndicators}
                </div>
                <div class="carousel-inner shadow-sm" style="border-radius: 10px;">
                    ${carouselItems}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>`;
    
        // Masukkan ke tempat gambar utama modal
        // Pastikan di index.html, area gambar modal loe punya id="modal-media-container"
        $('#modal-media-container').html(fullCarouselHTML);
    
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
