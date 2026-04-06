from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv
import os 
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

CSV_URL = os.getenv('spreet_sheet_url')

def clean_price_logic(price_raw):
    """
    Membersihkan string harga agar seragam (contoh: 12k -> 12000, 10rb -> 10000)
    Mengembalikan string angka murni atau rentang angka (misal: "10000-15000")
    """
    p = str(price_raw).lower().replace(' ', '')
    
    # Fungsi pembantu untuk konversi satuan
    def convert_unit(val_str):
        val_str = val_str.replace('k', '000').replace('rb', '000')
        digits = re.sub(r'[^0-9]', '', val_str)
        return digits if digits else "0"

    # Jika terdapat rentang (tanda hubung atau garis miring)
    if '-' in p or '/' in p:
        parts = re.split(r'[-/]', p)
        return f"{convert_unit(parts[0])}-{convert_unit(parts[1])}"
    
    return convert_unit(p)


def extract_drive_id(link):
    if pd.isna(link) or str(link) == '':
        return 'https://via.placeholder.com/400x300?text=No+Image'
    match = re.search(r'[-\w]{25,}', str(link))
    return f"https://drive.google.com/thumbnail?id={match.group(0)}&sz=s800" if match else 'https://via.placeholder.com/400x300?text=No+Image'

@app.route('/api/products')
def get_products():
    try:
        df = pd.read_csv(CSV_URL)
        df.columns = df.columns.str.strip()
        
        processed_data = []
        for _, row in df.iterrows():
            # Nomor WA: 08... -> 628...
            wa = re.sub(r'[^0-9]', '', str(row.iloc[3]))
            if wa.startswith('0'): wa = '62' + wa[1:]

            processed_data.append({
                "nama": str(row.iloc[1]).strip(),
                "harga_raw": clean_price_logic(row.iloc[2]), # Data string untuk diproses JS
                "wa": wa,
                "foto": extract_drive_id(row.iloc[4]),
                "kategori": str(row.iloc[5]).strip() if not pd.isna(row.iloc[5]) else "Lainnya",
                "deskripsi": str(row.iloc[6]).strip() if not pd.isna(row.iloc[6]) else ""
            })
            
        return jsonify(processed_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)