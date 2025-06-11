import React from 'react';
import { useNavigate } from 'react-router-dom';

const Introduction = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/datadiri'); // arahkan ke halaman berikutnya
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-xl w-full p-8 bg-white shadow-xl rounded-xl text-center border border-gray-200">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/assets/MainLogo.svg" // Ganti path sesuai gambar kamu
                        alt="Budgetease Logo"
                        className="h-24"
                    />
                </div>

                {/* Judul */}
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                    KEUANGANMU, GAYAMU
                </h1>
                <p className="text-lg font-medium text-gray-700 mb-6">
                    ATUR STRATEGI SESUAI KEBUTUHANMU
                </p>

                {/* Link kecil (opsional) */}
                <a href="#" className="text-sm text-blue-600 underline mb-4 block">
                    Pelajari lebih lanjut tentang Budgetease
                </a>

                {/* Tombol mulai */}
                <button
                    onClick={handleStart}
                    className="bg-emerald-900 text-white px-6 py-2 rounded hover:bg-emerald-800 transition"
                >
                    Personalize Strategimu
                </button>

                {/* Footer text */}
                <p className="text-xs text-gray-500 mt-6">
                    *Saat membuka halaman profil, data akan dikumpulkan untuk memberikan strategi keuangan yang lebih akurat dan relevan.
                </p>
            </div>
        </div>
    );
};

export default Introduction;
