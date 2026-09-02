import React, { useState } from 'react';
import { Briefcase, Plus, ShoppingCart, UserCheck, Phone, CheckCircle2, DollarSign } from 'lucide-react';
import { CrmCustomer } from '../../types';

interface InternalCrmAppProps {
  customers: CrmCustomer[];
  onAddOrder?: (customerId: string, amount: number) => void;
}

export const InternalCrmApp: React.FC<InternalCrmAppProps> = ({ customers }) => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'novo_pedido' | 'metas'>('clientes');
  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);
  const [orderAmount, setOrderAmount] = useState('3500');
  const [orderProduct, setOrderProduct] = useState('Kit Logístico 500 Unid.');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setActiveTab('clientes');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* App Top Bar */}
      <div className="bg-blue-900/40 border-b border-blue-700/50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">AlfaCRM Móvel</h3>
            <p className="text-[10px] text-blue-300">Vendas & Carteira Corporativa</p>
          </div>
        </div>
        <div className="flex items-center text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800 text-blue-300">
          Offline Sync OK
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800 p-1 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex-1 py-1.5 rounded text-center transition-all ${
            activeTab === 'clientes' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Clientes ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('novo_pedido')}
          className={`flex-1 py-1.5 rounded text-center transition-all ${
            activeTab === 'novo_pedido' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          + Novo Pedido
        </button>
        <button
          onClick={() => setActiveTab('metas')}
          className={`flex-1 py-1.5 rounded text-center transition-all ${
            activeTab === 'metas' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Metas do Mês
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {activeTab === 'clientes' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">Clientes atribuídos ao seu território:</p>
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c);
                  setActiveTab('novo_pedido');
                }}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl p-2.5 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold text-slate-100">{c.name}</h4>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      c.status === 'Ativo'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mb-2">{c.company}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/60">
                  <span className="flex items-center gap-1 text-blue-300">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    Último: R$ {c.lastOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'novo_pedido' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              Lançar Pedido de Venda
            </h4>

            {orderSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-700 rounded-lg p-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-emerald-200">Pedido Transmitido com Sucesso!</p>
                <p className="text-[10px] text-emerald-400">Integrado com ERP AlfaLog em canal criptografado.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateOrder} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Cliente Selecionado:</label>
                  <select
                    value={selectedCustomer?.id || customers[0].id}
                    onChange={(e) => {
                      const found = customers.find((c) => c.id === e.target.value);
                      if (found) setSelectedCustomer(found);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Item / Linha de Produto:</label>
                  <select
                    value={orderProduct}
                    onChange={(e) => setOrderProduct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Kit Logístico 500 Unid.">Kit Logístico 500 Unid. (Padrão)</option>
                    <option value="Palete de Distribuição Express">Palete de Distribuição Express</option>
                    <option value="Contrato Mensal de Suprimentos">Contrato Mensal de Suprimentos</option>
                    <option value="Pacote Especial de Varejo">Pacote Especial de Varejo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Valor Total (R$):</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500">R$</span>
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex justify-between">
                  <span>Validação Fiscal:</span>
                  <span className="text-emerald-400 font-semibold">Nota Eletrônica Pronta</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Emitir e Transmitir Pedido
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'metas' && (
          <div className="space-y-2.5">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-200">Meta Individual Setembro</span>
                <span className="text-xs font-bold text-emerald-400">76%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '76%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">R$ 152.000,00 de R$ 200.000,00 atingidos.</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-1.5">
              <h5 className="text-[11px] font-semibold text-slate-200">Próximos Passos Comerciais</h5>
              <div className="text-[10px] text-slate-400 space-y-1">
                <p>• Visitar Rede Estrela às 14:00 (Renovação de contrato anual)</p>
                <p>• Confirmar entrega de amostras na Santa Helena Farma</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
