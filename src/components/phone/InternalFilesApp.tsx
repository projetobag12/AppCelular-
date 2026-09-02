import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  Download,
  Upload,
  Cable,
  HardDrive,
  Search,
  CheckCircle2,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  folder: 'usb_imports' | 'downloads' | 'documents' | 'photos';
  size: string;
  date: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'jpg' | 'txt';
  source: 'Cabo USB (MTP)' | 'Download Interno' | 'Câmera';
  previewText?: string;
}

const INITIAL_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'manifesto_cargas_setembro.xlsx',
    folder: 'usb_imports',
    size: '1.4 MB',
    date: 'Hoje, 08:35',
    type: 'xlsx',
    source: 'Cabo USB (MTP)',
    previewText: 'Manifesto Eletrônico de Cargas nº 4492-SP. Total de 48 entregas roteirizadas para a frota AlfaLog.',
  },
  {
    id: 'f2',
    name: 'ordem_servico_integrada_2026.pdf',
    folder: 'usb_imports',
    size: '850 KB',
    date: 'Hoje, 08:40',
    type: 'pdf',
    source: 'Cabo USB (MTP)',
    previewText: 'Ordem de Serviço Técnica de Campo. Validação de conformidade de entrega e termo de recebimento.',
  },
  {
    id: 'f3',
    name: 'tabela_precos_atualizada_q3.xlsx',
    folder: 'usb_imports',
    size: '2.1 MB',
    date: 'Ontem, 17:15',
    type: 'xlsx',
    source: 'Cabo USB (MTP)',
    previewText: 'Tabela oficial de preços, margens de desconto e condições de pagamento para o trimestre.',
  },
  {
    id: 'f4',
    name: 'manual_operacional_condutores.pdf',
    folder: 'documents',
    size: '3.6 MB',
    date: '28/08/2026',
    type: 'pdf',
    source: 'Download Interno',
    previewText: 'Guia de Boas Práticas Operacionais, Checklist Diário do Veículo e Procedimentos de Emergência.',
  },
  {
    id: 'f5',
    name: 'comprovante_entrega_nf9021.jpg',
    folder: 'photos',
    size: '1.8 MB',
    date: '01/09/2026',
    type: 'jpg',
    source: 'Câmera',
    previewText: 'Comprovante assinado e carimbado pelo cliente Rede Estrela do Sul.',
  },
  {
    id: 'f6',
    name: 'catalogo_produtos_distribuicao.pdf',
    folder: 'downloads',
    size: '5.2 MB',
    date: '30/08/2026',
    type: 'pdf',
    source: 'Download Interno',
    previewText: 'Portfólio completo de produtos, especificações técnicas e fichas de segurança química.',
  },
];

export const InternalFilesApp: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activeFolder, setActiveFolder] = useState<'all' | 'usb_imports' | 'downloads' | 'documents' | 'photos'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isImportingUsb, setIsImportingUsb] = useState(false);
  const [importSuccessAlert, setImportSuccessAlert] = useState<string | null>(null);

  // Filtered list
  const filteredFiles = files.filter((file) => {
    const matchesFolder = activeFolder === 'all' || file.folder === activeFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleSimulateUsbImport = () => {
    setIsImportingUsb(true);
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 9000 + 1000);
      const newFile: FileItem = {
        id: `usb-${randomId}`,
        name: `romaneio_importado_cabo_${randomId}.xlsx`,
        folder: 'usb_imports',
        size: '1.2 MB',
        date: 'Agora mesmo',
        type: 'xlsx',
        source: 'Cabo USB (MTP)',
        previewText: `Arquivo transferido com sucesso via cabo USB do computador da base. Código de lote: LOT-${randomId}.`,
      };
      setFiles((prev) => [newFile, ...prev]);
      setIsImportingUsb(false);
      setImportSuccessAlert(`Arquivo "${newFile.name}" importado via cabo USB com sucesso!`);
      setTimeout(() => setImportSuccessAlert(null), 3500);
    }, 1000);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  };

  const renderFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'jpg':
        return <ImageIcon className="w-5 h-5 text-amber-400" />;
      default:
        return <FileCheck className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1115] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header */}
      <div className="bg-[#16191E] border-b border-slate-800 p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Meus Arquivos & Pastas</h3>
            <p className="text-[10px] text-slate-400">Armazenamento Interno do Celular</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Cable className="w-3 h-3 text-emerald-400" /> Cabo USB Liberado
          </span>
        </div>
      </div>

      {/* USB Connection Status Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#16191E] to-[#12141A] border-b border-emerald-800/40 p-2.5 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Cable className="w-3.5 h-3.5 text-emerald-400" /> Modo Cabo MTP: Ativo
            </span>
            <p className="text-[9px] text-slate-300">
              Transferência de planilhas, PDFs e documentos liberada via cabo.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateUsbImport}
          disabled={isImportingUsb}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition shadow"
          title="Importar novo arquivo via cabo USB"
        >
          {isImportingUsb ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" /> Importando...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" /> Importar via USB
            </>
          )}
        </button>
      </div>

      {/* Success alert banner */}
      {importSuccessAlert && (
        <div className="bg-emerald-500 text-slate-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between animate-in fade-in shadow">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            {importSuccessAlert}
          </span>
        </div>
      )}

      {/* Storage Summary Bar */}
      <div className="p-3 bg-[#12141A] border-b border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" /> Memória Interna
          </span>
          <span className="font-mono text-slate-400 text-[10px]">
            <strong className="text-white">14.8 GB</strong> usados de 128 GB
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 bg-[#16191E] border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar arquivos ou documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101319] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Folder Category Pills */}
      <div className="flex p-2 gap-1.5 bg-[#12141A] border-b border-slate-800 overflow-x-auto text-[11px] scrollbar-none">
        <button
          onClick={() => setActiveFolder('all')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
            activeFolder === 'all'
              ? 'bg-amber-600 text-white font-bold shadow'
              : 'bg-[#1A1D23] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todos ({files.length})
        </button>
        <button
          onClick={() => setActiveFolder('usb_imports')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
            activeFolder === 'usb_imports'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'bg-[#1A1D23] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Cable className="w-3 h-3 text-emerald-400" /> Importados USB ({files.filter((f) => f.folder === 'usb_imports').length})
        </button>
        <button
          onClick={() => setActiveFolder('downloads')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
            activeFolder === 'downloads'
              ? 'bg-blue-600 text-white font-bold shadow'
              : 'bg-[#1A1D23] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-3 h-3 text-blue-400" /> Downloads ({files.filter((f) => f.folder === 'downloads').length})
        </button>
        <button
          onClick={() => setActiveFolder('documents')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
            activeFolder === 'documents'
              ? 'bg-amber-600 text-white font-bold shadow'
              : 'bg-[#1A1D23] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Documentos ({files.filter((f) => f.folder === 'documents').length})
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <FolderOpen className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-xs font-semibold">Nenhum arquivo encontrado nesta pasta.</p>
            <p className="text-[10px] text-slate-500 mt-1">Conecte o cabo USB para transferir novos documentos.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="bg-[#16191E] border border-slate-800 hover:border-amber-500/80 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#101319] border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  {renderFileIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate max-w-[190px] group-hover:text-amber-300 transition">
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{file.source}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(file);
                  }}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                  title="Visualizar Detalhes"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  title="Excluir Arquivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#16191E] border border-slate-700 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#101319] flex items-center justify-center">
                  {renderFileIcon(selectedFile.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{selectedFile.size} • {selectedFile.date}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* File Info */}
            <div className="bg-[#101319] p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Origem:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Cable className="w-3 h-3" /> {selectedFile.source}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Tipo de Documento:</span>
                <span className="font-mono text-slate-200 uppercase">{selectedFile.type}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Status de Integridade:</span>
                <span className="text-emerald-400 font-semibold">100% Íntegro (Verificado)</span>
              </div>
            </div>

            {/* Simulated Content Preview */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Conteúdo do Arquivo:</span>
              <div className="bg-[#12141A] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans max-h-32 overflow-y-auto">
                {selectedFile.previewText || 'Visualização do documento renderizada em ambiente seguro.'}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition shadow"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
