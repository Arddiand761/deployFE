// src/pages/InformasiPribadi.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InformasiPribadi = () => {
    const navigate = useNavigate();

    const [statusPekerjaan, setStatusPekerjaan] = useState('');
    const [penghasilan, setPenghasilan] = useState('');
    const [sumber, setSumber] = useState('');
    const [pengeluaran, setPengeluaran] = useState('');
    const [tujuan, setTujuan] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ statusPekerjaan, penghasilan, sumber, pengeluaran, tujuan });
        // lanjut ke halaman berikutnya jika perlu
        navigate('/home'); // sesuaikan rute selanjutnya
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-3xl p-10 rounded-lg border shadow"
            >
                <h2 className="text-2xl font-bold text-center mb-8">Informasi Pribadi</h2>

                {/* Status Pekerjaan */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Status Pekerjaan</label>
                    <div className="flex flex-wrap gap-2">
                        {['Pegawai Tetap', 'Freelancer', 'Wiraswasta', 'Mahasiswa', 'Tidak Bekerja', 'Lainnya'].map((item) => (
                            <button
                                type="button"
                                key={item}
                                onClick={() => setStatusPekerjaan(item)}
                                className={`px-4 py-2 rounded-full border ${
                                    statusPekerjaan === item
                                        ? 'bg-green-700 text-white'
                                        : 'bg-white text-green-700 border-green-700'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Penghasilan Bulanan */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Penghasilan Bulanan</label>
                    <input
                        type="number"
                        value={penghasilan}
                        onChange={(e) => setPenghasilan(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Contoh: 5000000"
                        min="0"
                        required
                    />
                </div>

                {/* Sumber Penghasilan */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Sumber Penghasilan</label>
                    <div className="flex flex-wrap gap-2">
                        {['Gaji', 'Usaha', 'Investasi', 'Lainnya'].map((item) => (
                            <button
                                type="button"
                                key={item}
                                onClick={() => setSumber(item)}
                                className={`px-4 py-2 rounded-full border ${
                                    sumber === item
                                        ? 'bg-green-700 text-white'
                                        : 'bg-white text-green-700 border-green-700'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Informasi Pengeluaran */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Informasi Pengeluaran</label>
                    <input
                        type="text"
                        value={pengeluaran}
                        onChange={(e) => setPengeluaran(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Contoh: IDR 2.000.000 per bulan"
                        required
                    />
                </div>

                {/* Tujuan Keuangan */}
                <div className="mb-6">
                    <label className="block font-medium mb-1">Tujuan Keuangan Utama Anda?</label>
                    <input
                        type="text"
                        value={tujuan}
                        onChange={(e) => setTujuan(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Contoh: Menabung untuk rumah"
                        required
                    />
                </div>

                {/* Tombol Next */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded"
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InformasiPribadi;
