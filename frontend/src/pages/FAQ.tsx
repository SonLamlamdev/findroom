import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUser, FiHome, FiHelpCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const FAQItem = ({ question, answer, isOpen, onClick }: any) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden bg-white dark:bg-gray-800 transition-all">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={onClick}
      >
        <span className="font-semibold text-gray-800 dark:text-gray-200">{question}</span>
        {isOpen ? <FiChevronUp className="text-primary-600" /> : <FiChevronDown className="text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const tenantFAQs = [
    { q: t('faq.tenant.q1'), a: t('faq.tenant.a1') },
    { q: t('faq.tenant.q2'), a: t('faq.tenant.a2') },
    { q: t('faq.tenant.q3'), a: t('faq.tenant.a3') },
    { q: t('faq.tenant.q4'), a: t('faq.tenant.a4') },
  ];

  const landlordFAQs = [
    { q: t('faq.landlord.q1'), a: t('faq.landlord.a1') },
    { q: t('faq.landlord.q2'), a: t('faq.landlord.a2') },
    { q: t('faq.landlord.q3'), a: t('faq.landlord.a3') },
    { q: t('faq.landlord.q4'), a: t('faq.landlord.a4') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Header */}
      <div className="bg-primary-600 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <FiHelpCircle className="mx-auto text-5xl mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-2">{t('faq.title')}</h1>
          <p className="text-primary-100 max-w-xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-3xl mx-auto overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setActiveTab('tenant'); setOpenIndex(0); }}
              className={`flex-1 py-4 text-center font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'tenant' 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FiUser /> {t('faq.tabs.tenant')}
            </button>
            <button
              onClick={() => { setActiveTab('landlord'); setOpenIndex(0); }}
              className={`flex-1 py-4 text-center font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'landlord' 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FiHome /> {t('faq.tabs.landlord')}
            </button>
          </div>

          {/* FAQ List */}
          <div className="p-6 md:p-8 min-h-[400px]">
            {activeTab === 'tenant' ? (
              <div className="animate-fadeIn">
                {tenantFAQs.map((item, index) => (
                  <FAQItem
                    key={`tenant-${index}`}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === index}
                    onClick={() => toggleItem(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="animate-fadeIn">
                {landlordFAQs.map((item, index) => (
                  <FAQItem
                    key={`landlord-${index}`}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === index}
                    onClick={() => toggleItem(index)}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {t('faq.footer.text')}
              </p>
              <a href="mailto:support@findroom.vn" className="text-primary-600 font-bold hover:underline">
                {t('faq.footer.link')}
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FAQ;