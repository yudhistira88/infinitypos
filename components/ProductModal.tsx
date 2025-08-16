import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariation, ProductVariationOption } from '../types';
import { generateDescription } from '../services/geminiService';

const FormSection: React.FC<{ title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="md:col-span-1 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
        <p className="text-md font-semibold text-slate-800">{title}</p>
        {children}
    </div>
);

const FormInput = ({ id, label, required, children }: { id: string, label: string, required?: boolean, children: React.ReactNode }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const ImageIcon = () => <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>;

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> & { id?: number }) => void;
}

const emptyProduct: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: '',
    unit: '',
    description: '',
    variations: [],
    discount: { type: 'fixed', value: 0 },
};

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState(product || emptyProduct);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!product;

    useEffect(() => {
        setFormData(p => ({
            ...p,
            discount: p.discount || { type: 'fixed', value: 0 },
            variations: p.variations || [],
        }));
        setImageError(false);
    }, [formData.imageUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            discount: { ...prev.discount!, [name]: name === 'value' ? Number(value) : value } as any
        }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.name || !formData.category) {
            alert('Silakan isi Nama Produk dan Kategori terlebih dahulu.');
            return;
        }
        setIsGenerating(true);
        try {
            const description = await generateDescription(formData.name, formData.category);
            setFormData(prev => ({ ...prev, description }));
        } catch (error) {
            console.error(error);
            alert('Gagal menghasilkan deskripsi. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- VARIATION HANDLERS ---
    const handleAddVariationGroup = () => {
        const newGroup: ProductVariation = { name: '', selectionType: 'single', required: true, options: [{ name: '', priceAdjustment: 0 }] };
        setFormData(p => ({ ...p, variations: [...p.variations!, newGroup] }));
    }
    const handleVariationChange = (groupIndex: number, field: keyof ProductVariation, value: any) => {
        setFormData(p => {
            const newVariations = [...p.variations!];
            (newVariations[groupIndex] as any)[field] = value;
            return { ...p, variations: newVariations };
        });
    }
    const handleRemoveVariationGroup = (groupIndex: number) => {
        setFormData(p => ({ ...p, variations: p.variations!.filter((_, i) => i !== groupIndex) }));
    }
    const handleAddOption = (groupIndex: number) => {
        setFormData(p => {
            const newVariations = [...p.variations!];
            newVariations[groupIndex].options.push({ name: '', priceAdjustment: 0 });
            return { ...p, variations: newVariations };
        });
    }
    const handleOptionChange = (groupIndex: number, optionIndex: number, field: keyof ProductVariationOption, value: any) => {
         setFormData(p => {
            const newVariations = [...p.variations!];
            (newVariations[groupIndex].options[optionIndex] as any)[field] = value;
            return { ...p, variations: newVariations };
        });
    }
    const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
         setFormData(p => {
            const newVariations = [...p.variations!];
            newVariations[groupIndex].options = newVariations[groupIndex].options.filter((_, i) => i !== optionIndex);
            return { ...p, variations: newVariations };
        });
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (!dataToSave.discount?.value || dataToSave.discount.value <= 0) {
            delete dataToSave.discount;
        }
        onSave(dataToSave);
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar (JPG, PNG) yang diperbolehkan.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            setImageError(false);
        };
        reader.onerror = () => {
            console.error("Gagal membaca file");
            setImageError(true);
        };
        reader.readAsDataURL(file);
    };

    const inputClass = "block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100" aria-label="Close modal">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-5">
                            <FormSection title="Informasi Dasar">
                                <FormInput id="name" label="Nama Produk" required><input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="cth: Ayam Geprek Spesial" /></FormInput>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput id="category" label="Kategori" required><input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className={inputClass} placeholder="cth: Makanan" /></FormInput>
                                    <FormInput id="unit" label="Satuan"><input type="text" name="unit" id="unit" value={formData.unit || ''} onChange={handleChange} className={inputClass} placeholder="cth: Porsi, Gelas" /></FormInput>
                                </div>
                            </FormSection>
                             <FormSection title="Deskripsi & Gambar">
                                <div>
                                     <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi & Keterangan</label>
                                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-wait flex items-center gap-1">
                                            {isGenerating && <SpinnerIcon />}
                                            {isGenerating ? 'Membuat...' : 'Buat dengan AI ✨'}
                                        </button>
                                    </div>
                                    <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} className={inputClass} placeholder="Deskripsi singkat produk untuk pelanggan..."></textarea>
                                </div>
                                <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-slate-700 mb-1">Gambar Produk</label>
                                    <div className="mt-1 flex items-start gap-4">
                                        <div className="w-24 h-24 rounded-lg bg-slate-100 border border-dashed flex items-center justify-center overflow-hidden flex-shrink-0">
                                             {formData.imageUrl && !imageError ? (
                                                <img src={formData.imageUrl} alt="Pratinjau Produk" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                                            ) : (
                                                <div className="text-center text-slate-500 p-2"><ImageIcon /><p className="text-xs mt-1">Pratinjau</p></div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" hidden/>
                                            <button type="button" onClick={handleImageUploadClick} className="w-full text-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Upload</button>
                                             <div className="relative my-2"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div><div className="relative flex justify-center text-sm"><span className="bg-slate-50 px-2 text-slate-500">atau</span></div></div>
                                            <input type="text" name="imageUrl" value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl} onChange={handleChange} className={inputClass} placeholder="Tempel URL gambar" />
                                        </div>
                                    </div>
                                </div>
                            </FormSection>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-5">
                            <FormSection title="Harga & Stok">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput id="price" label="Harga Jual" required>
                                        <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500 sm:text-sm">Rp</span></div><input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className={`${inputClass} pl-9`} placeholder="15000" /></div>
                                    </FormInput>
                                    <FormInput id="stock" label="Stok" required>
                                        <div className="relative"><input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required className={`${inputClass}`} placeholder="0" /></div>
                                    </FormInput>
                                </div>
                                <div className="pt-2">
                                    <p className="text-sm font-medium text-slate-700 mb-1">Diskon Produk (Opsional)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select name="type" value={formData.discount?.type} onChange={handleDiscountChange} className={inputClass}><option value="fixed">Potongan (Rp)</option><option value="percentage">Persentase (%)</option></select>
                                        <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500 sm:text-sm">{formData.discount?.type === 'fixed' ? 'Rp' : '%'}</span></div><input type="number" name="value" value={formData.discount?.value || 0} onChange={handleDiscountChange} className={`${inputClass} pl-8`} placeholder="0" /></div>
                                    </div>
                                </div>
                            </FormSection>
                            <FormSection title="Variasi Produk (Opsional)">
                                {formData.variations?.map((group, groupIndex) => (
                                    <div key={groupIndex} className="p-3 bg-white border rounded-lg space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={group.name} onChange={(e) => handleVariationChange(groupIndex, 'name', e.target.value)} placeholder="Nama Variasi (cth: Ukuran)" className={inputClass} />
                                            <button type="button" onClick={() => handleRemoveVariationGroup(groupIndex)} className="text-red-500 hover:text-red-700 p-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                                        </div>
                                        <div className="pl-2 space-y-2">
                                            {group.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-2">
                                                    <input type="text" value={option.name} onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'name', e.target.value)} placeholder="Nama Opsi" className="flex-grow border-slate-300 rounded-md text-sm p-1" />
                                                    <input type="number" value={option.priceAdjustment} onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'priceAdjustment', Number(e.target.value))} placeholder="+/- Harga" className="w-24 border-slate-300 rounded-md text-sm p-1" />
                                                    <button type="button" onClick={() => handleRemoveOption(groupIndex, optionIndex)} className="text-slate-400 hover:text-red-600 p-0.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => handleAddOption(groupIndex)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Tambah Opsi</button>
                                        </div>
                                        <div className="border-t pt-2 flex items-center justify-end gap-4 text-xs">
                                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={group.required} onChange={(e) => handleVariationChange(groupIndex, 'required', e.target.checked)} className="rounded"/>Wajib Dipilih</label>
                                            <select value={group.selectionType} onChange={(e) => handleVariationChange(groupIndex, 'selectionType', e.target.value)} className="border-none bg-transparent text-xs p-0 focus:ring-0"><option value="single">Pilih Satu</option><option value="multiple">Pilih Banyak</option></select>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddVariationGroup} className="w-full text-sm font-semibold text-blue-600 border-2 border-dashed border-slate-300 rounded-lg py-2 hover:bg-blue-50">+ Tambah Grup Variasi</button>
                            </FormSection>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse rounded-b-xl border-t border-slate-200">
                        <button type="submit" className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 w-auto sm:text-sm">Simpan Produk</button>
                        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-auto sm:text-sm">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;