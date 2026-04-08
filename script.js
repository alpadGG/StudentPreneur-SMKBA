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
            // Di dalam loadProducts()
            products.forEach((item) => {
                // Ambil gambar pertama sebagai cover, jika tidak ada pakai placeholder
                const coverFoto = item.foto_list && item.foto_list.length > 0 ? item.foto_list[0] : 'https://via.placeholder.com/400x300';
                
                // Simpan semua foto sebagai string yang dipisahkan koma di atribut data agar mudah diambil modal
                const allFotos = item.foto_list.join(',');
            
                productHTML += `
                    <div class="col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger" 
                            data-nama="${item.nama}"
                            data-foto-all="${allFotos}" 
                            data-foto-cover="${coverFoto}"
                            ... (data lainnya) ...>
                            <div class="product-img-wrapper" style="height: 200px; overflow: hidden;">
                                <img src="${coverFoto}" class="w-100 h-100" style="object-fit: cover;">
                            </div>
                            ...
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
    const listFoto = d.fotoAll.split(','); // Pecah kembali string menjadi array

    // Update Modal
    $('#modal-title').text(d.nama);
    $('#modal-img').attr('src', d.fotoCover); // Gambar utama

    // OPSIONAL: Jika ingin membuat list gambar kecil di bawah gambar utama modal
    let galleryHTML = '';
    listFoto.forEach(imgUrl => {
        galleryHTML += `<img src="${imgUrl}" class="img-thumbnail me-1" style="width:60px; cursor:pointer;" onclick="$('#modal-img').attr('src', '${imgUrl}')">`;
    });
    
    // Pastikan di HTML modal ada <div id="modal-gallery"></div>
    $('#modal-gallery').html(galleryHTML); 
    
    // ... sisa logika modal ...
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
