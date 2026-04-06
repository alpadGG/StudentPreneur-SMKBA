# 🚀 StudentPreneur SMKBA

Aplikasi web *single-page* yang berfungsi sebagai katalog produk UMKM siswa. Proyek ini menggunakan **Flask** sebagai proxy untuk mengambil data secara dinamis dari Google Sheets API.

## 🛠️ Tech Stack
- **Backend:** Python (Flask)
- **Frontend:** HTML5, CSS3 (Bootstrap), JavaScript (jQuery)
- **Database/Data Source:** Google Sheets via API
- **Tools:** Laragon/Venv, VS Code

## ✨ Fitur Utama
- **Dynamic Fetching:** Mengambil data produk terbaru langsung dari spreadsheet tanpa perlu update kode manual.
- **Responsive Design:** Tampilan optimal di perangkat mobile maupun desktop.
- **Fast Loading:** Optimasi pengambilan data menggunakan Flask Proxy untuk menghindari isu CORS.

## 🚀 Cara Menjalankan di Lokal (Local Setup)
Pastikan kamu sudah menginstal Python, lalu jalankan perintah berikut:

1. Clone repositori ini:
   ```bash
   git clone [https://github.com/alpadGG/StudentPreneur-SMKBA.git](https://github.com/alpadGG/StudentPreneur-SMKBA.git)
   cd StudentPreneur-SMKBA
2. Buat dan aktifkan Virtual Environment:
   ```bash
   python -m venv venv
   # Windows cmd: 
   venv\Scripts\activate.bat
   # Windows poershell:
   .\venv\Scripts\Activate.ps1
   #linux
   source venv/bin/activate
3. Instal dependencies:
   ```bash
   pip install -r requirements.txt
4. Jalankan aplikasi
   ```bash
   python app.py
5. lihat url dimana flask python berjalan
   contoh : http://127.0.0.1:5000/endpointProxy
6. salin url flask lalu jalankan dengan javaScript
7. Struktur Folder
    - app.py: Logika backend dan API proxy.
    - static/: Berisi file CSS, JS, dan gambar.
    - templates/: Berisi file HTML (jika menggunakan Jinja2).

# Tampian
**kamu dapat melihat tampilan web StudentPreneur di url berikut**
https://alpadgg.github.io/StudentPreneur-SMKBA/
