import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DataDiri = () => {
    const navigate = useNavigate();

    const [nama, setNama] = useState('');
    const [umur, setUmur] = useState('');
    const [gender, setGender] = useState('');
    const [status, setStatus] = useState('');
    const [tanggungan, setTanggungan] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simpan data ke state global atau localStorage jika perlu
        console.log({ nama, umur, gender, status, tanggungan });
        navigate('/informasi'); // Ganti dengan rute selanjutnya
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-3xl p-10 rounded-lg border border-blue-400 shadow"
            >
                <h2 className="text-2xl font-bold text-center mb-8">Data Diri</h2>

                {/* Nama */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Nama</label>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Spongebob"
                        required
                    />
                </div>

                {/* Umur */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Umur</label>
                    <input
                        type="date"
                        value={umur}
                        onChange={(e) => setUmur(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Jenis Kelamin */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Jenis Kelamin</label>
                    <div className="flex gap-2 flex-wrap">
                        {['Laki-laki', 'Perempuan', 'Lainnya'].map((item) => (
                            <button
                                type="button"
                                key={item}
                                onClick={() => setGender(item)}
                                className={`px-4 py-2 rounded-full border ${
                                    gender === item
                                        ? 'bg-green-700 text-white'
                                        : 'bg-white text-green-700 border-green-700'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block font-medium mb-1">Status</label>
                    <div className="flex gap-2 flex-wrap">
                        {['Belum menikah', 'Menikah', 'Lainnya'].map((item) => (
                            <button
                                type="button"
                                key={item}
                                onClick={() => setStatus(item)}
                                className={`px-4 py-2 rounded-full border ${
                                    status === item
                                        ? 'bg-green-700 text-white'
                                        : 'bg-white text-green-700 border-green-700'
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jumlah Tanggungan */}
                <div className="mb-6">
                    <label className="block font-medium mb-1">Jumlah Tanggungan</label>
                    <input
                        type="number"
                        value={tanggungan}
                        onChange={(e) => setTanggungan(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="0"
                        min="0"
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

export default DataDiri;
