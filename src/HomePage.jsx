import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import FileUploader from './FileUploader';
import Header from './Header';
import ThemeToggle from './ThemeToggle';

export default function HomePage({ onLoaded }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0d0d0d] text-black dark:text-white transition-colors duration-300 flex flex-col">
      {/* Cabeçalho */}
      <Header />

      <div className="flex z-50 justify-between items-center mb-6">
        <ThemeToggle />
      </div>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto py-12 px-6 flex-grow">
        <h2 className="text-3xl font-semibold mb-4">Análise de Logins do Sistema PIMS</h2>
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          Este projeto foi desenvolvido para a <strong>ArcelorMittal</strong> com o objetivo de monitorar e analisar os padrões de autenticação no sistema <strong>PIMS</strong>.
          O sistema permite uma melhor tomada de decisão quanto à necessidade de aquisição ou redução de <strong>tokens de autenticação</strong>.
        </p>

        <h3 className="text-xl font-semibold mb-2">Como utilizar</h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-8">
          <li>Importe um arquivo CSV com os dados de logins do sistema PIMS abaixo.</li>
          <li>Utilize o filtro de data no Dashboard para analisar períodos específicos.</li>
          <li>Explore os gráficos para entender o comportamento de uso.</li>
          <li>Veja recomendações sobre a necessidade de tokens.</li>
        </ul>

        {/* Upload direto aqui */}
        <FileUploader onLoaded={onLoaded} />
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
