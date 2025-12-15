import React from 'react';
import { FiShield, FiAlertTriangle, FiCheckSquare, FiUserX, FiInfo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">{t('terms.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('terms.lastUpdated')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-4xl mx-auto p-8 border border-gray-200 dark:border-gray-700">
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p className="lead text-lg mb-8">
              {t('terms.intro')}
            </p>

            {/* 1. Account */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiShield className="mr-2" />
                {t('terms.s1.title')}
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('terms.s1.l1')}</li>
                <li>{t('terms.s1.l2')}</li>
                <li>{t('terms.s1.l3')}</li>
              </ul>
            </section>

            {/* 2. Landlord Rules */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiCheckSquare className="mr-2" />
                {t('terms.s2.title')}
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('terms.s2.l1')}</li>
                <li>{t('terms.s2.l2')}</li>
                <li>{t('terms.s2.l3')}</li>
                <li>{t('terms.s2.l4')}</li>
              </ul>
            </section>

            {/* 3. Prohibited Acts */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
                <FiUserX className="mr-2" />
                {t('terms.s3.title')}
              </h2>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                <ul className="list-disc pl-5 space-y-2 text-red-700 dark:text-red-300">
                  <li>{t('terms.s3.l1')}</li>
                  <li>{t('terms.s3.l2')}</li>
                  <li>{t('terms.s3.l3')}</li>
                  <li>{t('terms.s3.l4')}</li>
                </ul>
              </div>
            </section>

            {/* 4. Disclaimer - IMPORTANT */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-yellow-600 dark:text-yellow-500">
                <FiAlertTriangle className="mr-2" />
                {t('terms.s4.title')}
              </h2>
              <p className="mb-4">
                {t('terms.s4.intro')}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('terms.s4.l1')}</li>
                <li>{t('terms.s4.l2')}</li>
                <li>{t('terms.s4.l3')}</li>
              </ul>
            </section>

            {/* 5. Changes */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiInfo className="mr-2" />
                {t('terms.s5.title')}
              </h2>
              <p>
                {t('terms.s5.content')}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;