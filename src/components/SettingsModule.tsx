import React from 'react';
import { Settings as SettingsIcon, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { SchoolSettings } from '../types';

interface SettingsModuleProps {
  settings: SchoolSettings;
  setSettings: (data: SchoolSettings) => void;
}

export default function SettingsModule({ settings, setSettings }: SettingsModuleProps) {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <SettingsIcon className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Configurações do Sistema</h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">Gerencie os dados da unidade escolar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-blue-600 pl-3">Dados da Escola</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome da Unidade Escolar</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-medium"
                value={settings.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Endereço Completo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={settings.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Município</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.municipio}
                  onChange={e => handleChange('municipio', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">UF</label>
                <input 
                  type="text" 
                  maxLength={2}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center uppercase"
                  value={settings.uf}
                  onChange={e => handleChange('uf', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Telefone</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-blue-600 pl-3">Identidade Visual</h3>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 bg-gray-50">
              {settings.logo ? (
                <div className="relative group">
                  <img src={settings.logo} alt="Logo" className="max-h-32 object-contain rounded shadow-lg" />
                  <button 
                    onClick={() => handleChange('logo', '')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <ImageIcon size={64} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase mt-2">Nenhuma logo carregada</p>
                </div>
              )}
              
              <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors font-bold text-[10px] uppercase shadow-sm">
                Carregar Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed uppercase">
                A logo será exibida no cabeçalho de todos os documentos oficiais e relatórios gerados pelo sistema. Recomendamos o uso de imagens em formato PNG com fundo transparente.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button 
            onClick={() => alert('As configurações são salvas automaticamente na nuvem ao serem alteradas.')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs shadow-lg transition-all"
          >
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
