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

                // ... di dalam loadProducts() ...
            products.forEach((item) => {
                // Ambil gambar pertama sebagai cover utama
                const coverFoto = item.foto_list && item.foto_list.length > 0 ? item.foto_list[0] : 'https://via.placeholder.com/400x300';
                
                // Gabungkan semua URL gambar menjadi satu string dengan pemisah "|"
                const allFotos = item.foto_list.join('|');
            
                const pesanWA = `Halo admin, saya tertarik dengan produk "${item.nama}". Apakah masih tersedia?`;
                const linkWA = `https://wa.me/${item.wa}?text=${encodeURIComponent(pesanWA)}`;
            
                productHTML += `
                    <div class="col-md-4 col-lg-3 mb-4 product-item" data-category="${item.kategori}">
                        <div class="product-card shadow-sm h-100 border-0 product-card-trigger" 
                            style="cursor: pointer; transition: transform 0.2s;"
                            data-nama="${item.nama}"
                            data-harga="${item.harga_raw}"
                            data-foto-cover="${coverFoto}"
                            data-foto-all="${allFotos}" 
                            data-wa="${linkWA}"
                            data-kategori="${item.kategori}"
                            data-desc="${item.deskripsi}"
                            data-penjual="${item.penjual}"> 
                            <div class="product-img-wrapper" style="height: 200px; overflow: hidden; border-radius: 8px 8px 0 0;">
                                <img src="${coverFoto}" class="w-100 h-100" style="object-fit: cover;" alt="${item.nama}">
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
// ...



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



        // Mapping data ke elemen Modal

        $('#modal-title').text(d.nama);

        $('#modal-price').text(formatIDR(d.harga.toString()));

        $('#modal-img').attr('src', d.foto);

        $('#modal-category').text(d.kategori);

        $('#modal-wa-btn').attr('href', d.wa);

        

        // Menampilkan informasi Penjual (Nama & Jurusan Siswa)

    $(document).on('click', '.product-card-trigger', function() {
        const d = $(this).data();
        
        // Pecah string foto kembali menjadi array
        const fotoArray = d.fotoAll.split('|');
    
        // Mapping data dasar ke elemen Modal
        $('#modal-title').text(d.nama);
        $('#modal-price').text(formatIDR(d.harga.toString()));
        $('#modal-img').attr('src', d.fotoCover); // Set gambar utama awal
        $('#modal-category').text(d.kategori);
        $('#modal-wa-btn').attr('href', d.wa);
        $('#modal-seller').html(`<i class="bi bi-person-fill me-1"></i> Penjual: <strong>${d.penjual}</strong>`);
    
        // --- LOGIKA GALERI MULTIPLE IMAGES ---
        let galleryHTML = '';
        
        // Buat HTML untuk setiap thumbnail
        fotoArray.forEach((url, index) => {
            galleryHTML += `
                <div class="col-3 mb-2">
                    <img src="${url}" 
                         class="img-thumbnail thumb-gallery ${index === 0 ? 'border-primary' : ''}" 
                         style="height: 60px; width: 100%; object-fit: cover; cursor: pointer;"
                         onclick="$('#modal-img').attr('src', '${url}'); $('.thumb-gallery').removeClass('border-primary'); $(this).addClass('border-primary');">
                </div>
            `;
        });
    
        // Masukkan galleryHTML ke dalam kontainer di modal
        // Pastikan di HTML Modal kamu ada <div id="modal-gallery-container" class="row mt-3"></div>
        if ($('#modal-gallery-container').length === 0) {
            // Jika belum ada kontainernya di HTML, kita tambahkan setelah gambar utama
            $('#modal-img').after('<div id="modal-gallery-container" class="row gx-2 mt-2"></div>');
        }
        $('#modal-gallery-container').html(galleryHTML);
    
        // Logika deskripsi
        const finalDesc = d.desc ? d.desc : `Dapatkan produk ${d.nama} berkualitas tinggi hanya di StudentPreneur SMKBA.`;
        $('#modal-desc').text(finalDesc);
    
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
